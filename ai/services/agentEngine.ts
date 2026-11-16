import { GoogleGenAI } from "@google/genai";
import {
  DEFAULT_GEMINI_MODEL,
  FURNIRO_AGENT_SYSTEM_INSTRUCTION,
} from "@ai/config/constants";
import { FURNIRO_AGENT_TOOLS } from "@ai/config/tools";
import {
  findProductByQueryOrId,
  getComplementaryProducts,
  getProductReviewsForAi,
  lookupOrdersForAi,
  searchCatalogProducts,
} from "@ai/services/catalogService";
import { runVisualSearch } from "@ai/services/visualSearchEngine";
import {
  AiChatRequest,
  AiChatResponse,
  AiClientAction,
  AiClientActionType,
  AiOrderSummary,
  AiProductCard,
} from "@ai/types";

interface RunAgentOptions extends AiChatRequest {
  userEmail?: string | null;
  userName?: string | null;
}

export async function runFurniroAgent(
  options: RunAgentOptions
): Promise<AiChatResponse> {
  const {
    message,
    previousInteractionId,
    pageContext,
    imageBase64,
    imageMimeType,
    userEmail,
    userName,
  } = options;

  // 1. Handle in-chat Visual Search if an image was attached
  if (imageBase64) {
    const visualResult = await runVisualSearch({
      imageBase64,
      mimeType: imageMimeType,
      customHint: message,
    });

    return {
      reply: `${visualResult.summary} Here are the closest matching pieces from our collection:`,
      products: visualResult.products,
      visualAnalysis: {
        detectedStyle: visualResult.detectedStyle,
        detectedCategory: visualResult.detectedCategory,
        colorPalette: visualResult.colorPalette,
        summary: visualResult.summary,
      },
      aiMode: visualResult.aiMode,
    };
  }

  // Resolve current product from cached catalog if user is on /product/[id]
  let currentProduct: AiProductCard | null = null;
  if (pageContext?.currentProductId) {
    currentProduct = await findProductByQueryOrId(pageContext.currentProductId);
  }

  const collectedProducts: AiProductCard[] = [];
  const collectedOrders: AiOrderSummary[] = [];
  const collectedClientActions: AiClientAction[] = [];

  async function executeToolCall(
    name: string,
    args: Record<string, unknown>
  ): Promise<string> {
    if (name === "search_products") {
      const results = await searchCatalogProducts({
        query: typeof args.query === "string" ? args.query : "",
        category: typeof args.category === "string" ? args.category : "",
        maxPrice: typeof args.maxPrice === "number" ? args.maxPrice : undefined,
        minPrice: typeof args.minPrice === "number" ? args.minPrice : undefined,
        onlyDiscounted: Boolean(args.onlyDiscounted),
        onlyNew: Boolean(args.onlyNew),
        limit: typeof args.limit === "number" ? args.limit : 4,
      });

      for (const p of results) {
        if (!collectedProducts.some((existing) => existing.id === p.id)) {
          collectedProducts.push(p);
        }
      }

      return JSON.stringify({
        count: results.length,
        products: results.map((p) => ({
          id: p.id,
          title: p.title,
          finalPrice: p.finalPrice,
        })),
      });
    }

    if (name === "manage_cart_or_wishlist") {
      const action = (args.action as AiClientActionType) || "ADD_TO_CART";
      const quantity =
        typeof args.quantity === "number" && args.quantity > 0
          ? Math.min(10, Math.round(args.quantity))
          : 1;

      if (action === "CLEAR_CART") {
        collectedClientActions.push({ type: "CLEAR_CART" });
        return JSON.stringify({ status: "success", action: "CLEAR_CART" });
      }

      const queryTarget =
        (typeof args.productQuery === "string" && args.productQuery.trim()) ||
        currentProduct?.id ||
        currentProduct?.title ||
        "";

      const matchedProduct = await findProductByQueryOrId(queryTarget);
      if (!matchedProduct) {
        return JSON.stringify({ status: "not_found" });
      }

      collectedClientActions.push({
        type: action,
        product: matchedProduct,
        quantity,
      });

      if (!collectedProducts.some((p) => p.id === matchedProduct.id)) {
        collectedProducts.push(matchedProduct);
      }

      return JSON.stringify({
        status: "success",
        action,
        quantity,
        title: matchedProduct.title,
      });
    }

    if (name === "track_order") {
      const trackingOrOrderId =
        typeof args.trackingOrOrderId === "string"
          ? args.trackingOrOrderId
          : undefined;

      const orders = await lookupOrdersForAi({
        userEmail,
        trackingOrOrderId,
      });

      for (const o of orders) {
        if (!collectedOrders.some((existing) => existing.orderId === o.orderId)) {
          collectedOrders.push(o);
        }
      }

      return JSON.stringify({
        orderCount: orders.length,
      });
    }

    if (name === "get_product_details") {
      const targetQuery =
        (typeof args.productIdOrTitle === "string" && args.productIdOrTitle) ||
        currentProduct?.id ||
        "";
      const product = await findProductByQueryOrId(targetQuery);
      if (!product) {
        return JSON.stringify({ error: "Product not found" });
      }

      const reviews = await getProductReviewsForAi(product.id);
      if (args.includePairings) {
        const pairings = await getComplementaryProducts(product, 3);
        for (const pair of pairings) {
          if (!collectedProducts.some((p) => p.id === pair.id)) {
            collectedProducts.push(pair);
          }
        }
      } else if (!collectedProducts.some((p) => p.id === product.id)) {
        collectedProducts.push(product);
      }

      return JSON.stringify({
        title: product.title,
        reviewCount: reviews.length,
      });
    }

    return JSON.stringify({ error: `Unknown tool ${name}` });
  }

  // 2. FAST-PATH HYBRID ROUTER:
  // Resolve clear deterministic intents (order tracking, cart/wishlist commands,
  // page-aware pairings, and direct catalog filter queries) in <150ms with 0 API token cost.
  const fastResult = await tryFastDeterministicIntent({
    message,
    currentProduct,
    userEmail,
    userName,
    executeToolCall,
    collectedProducts,
    collectedOrders,
    collectedClientActions,
  });

  if (fastResult) {
    return fastResult;
  }

  // 3. SINGLE-PASS GEMINI CALL (for open-ended / conversational questions):
  // Uses `gemini-3.5-flash-lite` with `thinking_level: "minimal"` and 1 single round-trip.
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const contextBanner = [
        userName ? `Shopper: ${userName}` : "",
        currentProduct
          ? `Viewing: "${currentProduct.title}" ($${currentProduct.finalPrice}, Tags: ${currentProduct.tags.slice(0, 4).join(", ")})`
          : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const contextualizedInput = contextBanner
        ? `[${contextBanner}] ${message}`
        : message;

      const interaction = await ai.interactions.create({
        model: DEFAULT_GEMINI_MODEL,
        system_instruction: FURNIRO_AGENT_SYSTEM_INSTRUCTION,
        input: contextualizedInput,
        tools: FURNIRO_AGENT_TOOLS,
        generation_config: {
          thinking_level: "minimal",
        },
        ...(previousInteractionId
          ? { previous_interaction_id: previousInteractionId }
          : {}),
      });

      const functionCallSteps = (interaction.steps || []).filter(
        (step: { type?: string }) => step.type === "function_call"
      ) as Array<{
        type: "function_call";
        id: string;
        name: string;
        arguments: Record<string, unknown>;
      }>;

      // If Gemini invoked tools, execute them locally and format the reply immediately
      // without a second slow LLM round-trip!
      if (functionCallSteps.length > 0) {
        for (const fc of functionCallSteps) {
          await executeToolCall(fc.name, fc.arguments || {});
        }

        const directText = (interaction.output_text || "").trim();
        const synthesizedReply =
          directText ||
          buildInstantToolReply({
            collectedProducts,
            collectedOrders,
            collectedClientActions,
            currentProduct,
            userEmail,
          });

        return {
          reply: synthesizedReply,
          interactionId: interaction.id,
          products: collectedProducts.length > 0 ? collectedProducts : undefined,
          orders: collectedOrders.length > 0 ? collectedOrders : undefined,
          clientActions:
            collectedClientActions.length > 0
              ? collectedClientActions
              : undefined,
          aiMode: "gemini",
        };
      }

      const replyText = (interaction.output_text || "").trim();
      if (replyText) {
        return {
          reply: replyText,
          interactionId: interaction.id,
          products: collectedProducts.length > 0 ? collectedProducts : undefined,
          orders: collectedOrders.length > 0 ? collectedOrders : undefined,
          clientActions:
            collectedClientActions.length > 0
              ? collectedClientActions
              : undefined,
          aiMode: "gemini",
        };
      }
    } catch (err) {
      console.error("Gemini agent interaction error, using local fallback:", err);
    }
  }

  // 4. Fallback for general queries when offline or key quota reached
  return runSmartLocalFallback({
    message,
    currentProduct,
    executeToolCall,
    collectedProducts,
  });
}

function buildInstantToolReply(params: {
  collectedProducts: AiProductCard[];
  collectedOrders: AiOrderSummary[];
  collectedClientActions: AiClientAction[];
  currentProduct: AiProductCard | null;
  userEmail?: string | null;
}): string {
  const {
    collectedProducts,
    collectedOrders,
    collectedClientActions,
    currentProduct,
    userEmail,
  } = params;

  if (collectedClientActions.length > 0) {
    const act = collectedClientActions[0];
    if (act.type === "CLEAR_CART") {
      return "I've cleared your shopping cart. Let me know what pieces you'd like to explore next!";
    }
    if (act.product) {
      if (act.type === "ADD_TO_CART") {
        return `Added **${act.quantity || 1}x ${act.product.title}** ($${act.product.finalPrice}) to your cart!`;
      }
      if (act.type === "REMOVE_FROM_CART") {
        return `Removed **${act.product.title}** from your cart.`;
      }
      return `Updated **${act.product.title}** in your wishlist!`;
    }
  }

  if (collectedOrders.length > 0) {
    const latest = collectedOrders[0];
    return `Found your order! Order **#${latest.orderId.slice(0, 8)}** is currently **${latest.orderStatus}** ($${latest.totalPrice.toLocaleString()}).`;
  }

  if (collectedProducts.length > 0) {
    if (currentProduct && collectedProducts.every((p) => p.id !== currentProduct.id)) {
      return `Here are our top pieces that pair harmoniously with **${currentProduct.title}**:`;
    }
    return `I found **${collectedProducts.length}** matching pieces in our collection for you:`;
  }

  if (!userEmail) {
    return "Please sign in or share an Order ID so I can look that up for you.";
  }

  return "Here is what I found in our showroom catalog:";
}

async function tryFastDeterministicIntent(params: {
  message: string;
  currentProduct: AiProductCard | null;
  userEmail?: string | null;
  userName?: string | null;
  executeToolCall: (name: string, args: Record<string, unknown>) => Promise<string>;
  collectedProducts: AiProductCard[];
  collectedOrders: AiOrderSummary[];
  collectedClientActions: AiClientAction[];
}): Promise<AiChatResponse | null> {
  const {
    message,
    currentProduct,
    userEmail,
    userName,
    executeToolCall,
    collectedProducts,
    collectedOrders,
    collectedClientActions,
  } = params;

  const lower = message.trim().toLowerCase();

  // A. Order Tracking Intent
  if (
    lower.includes("track") ||
    lower.includes("where is my order") ||
    lower.includes("my latest order") ||
    lower.includes("order status") ||
    lower.includes("delivery status")
  ) {
    const idMatch = message.match(
      /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}|#[a-zA-Z0-9_-]{6,})/
    );
    const extractedId = idMatch ? idMatch[1].replace(/^#/, "") : undefined;

    await executeToolCall("track_order", {
      trackingOrOrderId: extractedId,
    });

    if (collectedOrders.length > 0) {
      const latest = collectedOrders[0];
      return {
        reply: `I found ${
          collectedOrders.length === 1
            ? "your order"
            : `your ${collectedOrders.length} most recent orders`
        }! Order **#${latest.orderId.slice(0, 8)}** is currently **${
          latest.orderStatus
        }** ($${latest.totalPrice.toLocaleString()}).`,
        orders: collectedOrders,
        aiMode: "smart-local",
      };
    }

    if (!userEmail && !extractedId) {
      return {
        reply:
          "Please sign in to view your recent orders automatically, or paste your **Order ID** right here (e.g., `Track order #...`) and I'll look it up immediately!",
        aiMode: "smart-local",
      };
    }

    return {
      reply: extractedId
        ? `I couldn't find an order matching **#${extractedId}**. Double-check your Order ID on the My Orders page.`
        : `Hi ${userName || "there"}! You don't have any placed orders under **${userEmail}** yet.`,
      aiMode: "smart-local",
    };
  }

  // B. Clear Cart Intent
  if (
    lower.includes("clear cart") ||
    lower.includes("empty cart") ||
    lower.includes("clear my cart")
  ) {
    await executeToolCall("manage_cart_or_wishlist", { action: "CLEAR_CART" });
    return {
      reply:
        "I've cleared your shopping cart for you. Let me know what pieces you'd like to explore next!",
      clientActions: collectedClientActions,
      aiMode: "smart-local",
    };
  }

  // C. Add / Remove Cart or Favorites Intent
  const isAddCart =
    (lower.includes("add") || lower.includes("put") || lower.includes("buy")) &&
    (lower.includes("cart") || lower.includes("bag") || lower.includes("basket"));
  const isRemoveCart =
    lower.includes("remove") && (lower.includes("cart") || lower.includes("bag"));
  const isAddFav =
    (lower.includes("save") ||
      lower.includes("favorite") ||
      lower.includes("wishlist") ||
      lower.includes("heart")) &&
    !lower.includes("remove");

  if (isAddCart || isRemoveCart || isAddFav) {
    const qtyMatch = lower.match(/\b(\d+)\b/);
    const quantity = qtyMatch
      ? Math.min(10, Math.max(1, parseInt(qtyMatch[1], 10)))
      : 1;

    const cleanedTarget = lower
      .replace(
        /\b(please|can you|add|put|remove|save|to|from|my|the|cart|bag|basket|wishlist|favorites|favorite|of|this|item|piece|product|\d+)\b/g,
        " "
      )
      .trim();

    const action: AiClientActionType = isRemoveCart
      ? "REMOVE_FROM_CART"
      : isAddFav
        ? "ADD_TO_FAVORITES"
        : "ADD_TO_CART";

    await executeToolCall("manage_cart_or_wishlist", {
      action,
      productQuery: cleanedTarget || currentProduct?.id || "",
      quantity,
    });

    if (collectedClientActions.length > 0 && collectedClientActions[0].product) {
      const targetProd = collectedClientActions[0].product;
      const actionText =
        action === "ADD_TO_CART"
          ? `Added **${quantity}x ${targetProd.title}** ($${targetProd.finalPrice} each) to your cart!`
          : action === "REMOVE_FROM_CART"
            ? `Removed **${targetProd.title}** from your cart.`
            : `Saved **${targetProd.title}** to your wishlist!`;

      return {
        reply: actionText,
        products: collectedProducts,
        clientActions: collectedClientActions,
        aiMode: "smart-local",
      };
    }

    return {
      reply:
        "Tell me the product name you'd like to add (for example, *'Add 1 Syltherine to my cart'*), or click **Add to Cart** on any product card!",
      aiMode: "smart-local",
    };
  }

  // D. Page-Aware Product Context Intent (when viewing /product/[id])
  if (
    currentProduct &&
    (lower.includes("pair") ||
      lower.includes("match") ||
      lower.includes("small apartment") ||
      lower.includes("fit a small"))
  ) {
    if (lower.includes("pair") || lower.includes("match")) {
      await executeToolCall("get_product_details", {
        productIdOrTitle: currentProduct.id,
        includePairings: true,
      });
      return {
        reply: `Because **${currentProduct.title}** ($${currentProduct.finalPrice}) features ${currentProduct.tags
          .slice(0, 3)
          .join(", ")} styling, it pairs wonderfully with these complementary pieces:`,
        products: collectedProducts,
        aiMode: "smart-local",
      };
    }

    return {
      reply: `Yes — **${currentProduct.title}** ($${
        currentProduct.finalPrice
      }) has a tailored footprint and ${currentProduct.tags
        .slice(0, 3)
        .join(", ")} silhouette that fits small apartments and studios without crowding the room.`,
      products: [currentProduct],
      aiMode: "smart-local",
    };
  }

  // E. Direct Catalog Filter / Quick Chip Queries (Price / Sale / New / Category)
  const priceMatch =
    lower.match(/(?:under|below|less than|max|budget)\s*\$?\s*(\d+)/) ||
    lower.match(/\$\s*(\d+)/);
  const maxPrice = priceMatch ? parseInt(priceMatch[1], 10) : undefined;
  const onlyDiscounted =
    lower.includes("sale") ||
    lower.includes("discount") ||
    lower.includes("deal") ||
    lower.includes("offer");
  const onlyNew =
    lower.includes("new arrival") ||
    lower.includes("newest") ||
    lower.includes("latest");

  let category = "";
  for (const cat of [
    "living",
    "dining",
    "bedroom",
    "sofa",
    "chair",
    "table",
    "lamp",
  ]) {
    if (lower.includes(cat)) {
      category = cat;
      break;
    }
  }

  const isDirectCatalogSearch =
    Boolean(maxPrice) ||
    onlyDiscounted ||
    onlyNew ||
    (Boolean(category) &&
      (lower.includes("show") ||
        lower.includes("recommend") ||
        lower.includes("find") ||
        lower.includes("looking for") ||
        lower.includes("need") ||
        lower.split(/\s+/).length <= 7));

  if (isDirectCatalogSearch) {
    await executeToolCall("search_products", {
      query: message,
      category,
      maxPrice,
      onlyDiscounted,
      onlyNew,
      limit: 4,
    });

    if (collectedProducts.length > 0) {
      const filterNotes = [
        category ? `for **${category}**` : "",
        maxPrice ? `under **$${maxPrice}**` : "",
        onlyDiscounted ? "**currently on sale**" : "",
        onlyNew ? "from our **new arrivals**" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return {
        reply: `Here are the top Furniro pieces ${
          filterNotes || "from our collection"
        } — you can add any item directly to your cart or wishlist below:`,
        products: collectedProducts,
        aiMode: "smart-local",
      };
    }
  }

  return null;
}

async function runSmartLocalFallback(params: {
  message: string;
  currentProduct: AiProductCard | null;
  executeToolCall: (name: string, args: Record<string, unknown>) => Promise<string>;
  collectedProducts: AiProductCard[];
}): Promise<AiChatResponse> {
  const { message, currentProduct, executeToolCall, collectedProducts } = params;

  await executeToolCall("search_products", {
    query: message,
    limit: 4,
  });

  if (collectedProducts.length > 0) {
    return {
      reply:
        "Here are the closest matching pieces from our showroom catalog. You can add any item to your cart or wishlist right from the cards below:",
      products: collectedProducts,
      aiMode: "smart-local",
    };
  }

  if (currentProduct) {
    return {
      reply: `You're viewing **${currentProduct.title}** ($${currentProduct.finalPrice}). Would you like me to add it to your cart or find complementary furniture pieces?`,
      products: [currentProduct],
      aiMode: "smart-local",
    };
  }

  return {
    reply:
      "I can help you discover furniture by room or budget, add items to your cart, match styles from a photo, or track your orders. Try asking *'Show me modern chairs under $250'* or *'What's currently on sale?'*",
    aiMode: "smart-local",
  };
}
