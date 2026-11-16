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

  // Resolve current product if user is browsing /product/[id]
  let currentProduct: AiProductCard | null = null;
  if (pageContext?.currentProductId) {
    currentProduct = await findProductByQueryOrId(pageContext.currentProductId);
  }

  const collectedProducts: AiProductCard[] = [];
  const collectedOrders: AiOrderSummary[] = [];
  const collectedClientActions: AiClientAction[] = [];

  // Shared tool executor used by both Gemini Function Calling & Smart Local Agent
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
          originalPrice: p.price,
          discountPercentage: p.discountPercentage,
          isNew: p.isNew,
          tags: p.tags.slice(0, 5),
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
        return JSON.stringify({
          status: "success",
          action: "CLEAR_CART",
          message: "Cleared the user's shopping cart.",
        });
      }

      const queryTarget =
        (typeof args.productQuery === "string" && args.productQuery.trim()) ||
        currentProduct?.id ||
        currentProduct?.title ||
        "";

      const matchedProduct = await findProductByQueryOrId(queryTarget);
      if (!matchedProduct) {
        return JSON.stringify({
          status: "not_found",
          message: `Could not find a product matching "${queryTarget}".`,
        });
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
        product: {
          id: matchedProduct.id,
          title: matchedProduct.title,
          finalPrice: matchedProduct.finalPrice,
        },
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
        authenticatedUser: Boolean(userEmail),
        orderCount: orders.length,
        orders: orders.map((o) => ({
          orderId: o.orderId,
          status: o.orderStatus,
          paymentStatus: o.paymentStatus,
          totalPrice: o.totalPrice,
          createdAt: o.createdAt,
          items: o.items.map((i) => `${i.quantity}x ${i.title}`),
        })),
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
      let pairings: AiProductCard[] = [];
      if (args.includePairings) {
        pairings = await getComplementaryProducts(product, 3);
        for (const pair of pairings) {
          if (!collectedProducts.some((p) => p.id === pair.id)) {
            collectedProducts.push(pair);
          }
        }
      } else if (!collectedProducts.some((p) => p.id === product.id)) {
        collectedProducts.push(product);
      }

      return JSON.stringify({
        product: {
          id: product.id,
          title: product.title,
          finalPrice: product.finalPrice,
          discountPercentage: product.discountPercentage,
          tags: product.tags,
          description: (product.description || "").slice(0, 400),
        },
        reviewCount: reviews.length,
        pairings: pairings.map((p) => ({
          id: p.id,
          title: p.title,
          finalPrice: p.finalPrice,
        })),
      });
    }

    return JSON.stringify({ error: `Unknown tool ${name}` });
  }

  // 2. Try Google Gemini Interactions API with Function Calling if GEMINI_API_KEY is available
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const contextBanner = [
        userName ? `Signed-in shopper: ${userName} (${userEmail || ""})` : "Shopper: Guest",
        pageContext?.pathname ? `Current page: ${pageContext.pathname}` : "",
        currentProduct
          ? `Currently viewing product: "${currentProduct.title}" (ID: ${currentProduct.id}, Price: $${currentProduct.finalPrice}, Tags: ${currentProduct.tags.join(", ")})`
          : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const contextualizedInput = contextBanner
        ? `[Context: ${contextBanner}]\nUser: ${message}`
        : message;

      let interaction = await ai.interactions.create({
        model: DEFAULT_GEMINI_MODEL,
        system_instruction: FURNIRO_AGENT_SYSTEM_INSTRUCTION,
        input: contextualizedInput,
        tools: FURNIRO_AGENT_TOOLS,
        ...(previousInteractionId
          ? { previous_interaction_id: previousInteractionId }
          : {}),
      });

      // Execute up to 2 rounds of function calls if requested by Gemini
      for (let round = 0; round < 2; round++) {
        const functionCallSteps = (interaction.steps || []).filter(
          (step: { type?: string }) => step.type === "function_call"
        ) as Array<{
          type: "function_call";
          id: string;
          name: string;
          arguments: Record<string, unknown>;
        }>;

        if (functionCallSteps.length === 0) break;

        const resultInputs = [];
        for (const fc of functionCallSteps) {
          const toolOutput = await executeToolCall(
            fc.name,
            fc.arguments || {}
          );
          resultInputs.push({
            type: "function_result" as const,
            call_id: fc.id,
            name: fc.name,
            result: [{ type: "text" as const, text: toolOutput }],
          });
        }

        interaction = await ai.interactions.create({
          model: DEFAULT_GEMINI_MODEL,
          system_instruction: FURNIRO_AGENT_SYSTEM_INSTRUCTION,
          previous_interaction_id: interaction.id,
          tools: FURNIRO_AGENT_TOOLS,
          input: resultInputs,
        });
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
      console.error("Gemini agent interaction error, falling back to local agent:", err);
    }
  }

  // 3. Deterministic Smart Local Agent (when GEMINI_API_KEY is not set)
  return runSmartLocalAgent({
    message,
    currentProduct,
    userEmail,
    userName,
    executeToolCall,
    collectedProducts,
    collectedOrders,
    collectedClientActions,
  });
}

async function runSmartLocalAgent(params: {
  message: string;
  currentProduct: AiProductCard | null;
  userEmail?: string | null;
  userName?: string | null;
  executeToolCall: (name: string, args: Record<string, unknown>) => Promise<string>;
  collectedProducts: AiProductCard[];
  collectedOrders: AiOrderSummary[];
  collectedClientActions: AiClientAction[];
}): Promise<AiChatResponse> {
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
    lower.includes("my order") ||
    lower.includes("order status") ||
    lower.includes("delivery status")
  ) {
    // Check if user pasted a UUID or order ID token
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
        }** ($${latest.totalPrice.toLocaleString()}). You can view the live status card below:`,
        orders: collectedOrders,
        aiMode: "smart-local",
      };
    }

    if (!userEmail && !extractedId) {
      return {
        reply:
          "Please sign in to view your recent orders automatically, or paste your **Order ID / Tracking ID** right here in the chat (e.g., `Track order #...`) and I'll look it up immediately!",
        aiMode: "smart-local",
      };
    }

    return {
      reply: extractedId
        ? `I couldn't find an order matching **#${extractedId}**. Double-check your Order ID on the My Orders page or try another ID.`
        : `Hi ${userName || "there"}! You don't have any placed orders under **${userEmail}** yet. Once you place an order, I can track every step of its delivery here.`,
      aiMode: "smart-local",
    };
  }

  // B. Clear Cart Intent
  if (lower.includes("clear cart") || lower.includes("empty cart") || lower.includes("clear my cart")) {
    await executeToolCall("manage_cart_or_wishlist", { action: "CLEAR_CART" });
    return {
      reply: "I've cleared your shopping cart for you. Let me know what pieces you'd like to explore next!",
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
    const quantity = qtyMatch ? Math.min(10, Math.max(1, parseInt(qtyMatch[1], 10))) : 1;

    // Strip command words to isolate product name
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
        "Which piece would you like me to add? Tell me the product name (for example, *'Add 1 Syltherine to my cart'* or *'Add Respira to my wishlist'*), or click **Add to Cart** on any recommended card!",
      aiMode: "smart-local",
    };
  }

  // D. Page-Aware Product Context Intent (when viewing /product/[id])
  if (
    currentProduct &&
    (lower.includes("this") ||
      lower.includes("pair") ||
      lower.includes("match") ||
      lower.includes("small") ||
      lower.includes("apartment") ||
      lower.includes("worth") ||
      lower.includes("about"))
  ) {
    if (lower.includes("pair") || lower.includes("match") || lower.includes("complem")) {
      await executeToolCall("get_product_details", {
        productIdOrTitle: currentProduct.id,
        includePairings: true,
      });
      return {
        reply: `Because **${currentProduct.title}** ($${currentProduct.finalPrice}) features ${currentProduct.tags
          .slice(0, 3)
          .join(", ")} styling, it pairs wonderfully with these complementary Furniro pieces:`,
        products: collectedProducts,
        aiMode: "smart-local",
      };
    }

    return {
      reply: `You're currently viewing **${currentProduct.title}** ($${
        currentProduct.finalPrice
      }${
        currentProduct.discountPercentage > 0
          ? `, ${currentProduct.discountPercentage}% off`
          : ""
      }). Its tailored proportions and ${currentProduct.tags
        .slice(0, 3)
        .join(", ")} aesthetic make it an excellent fit for both compact apartments and open-concept rooms. Would you like me to add it to your cart or show matching pieces?`,
      products: [currentProduct],
      aiMode: "smart-local",
    };
  }

  // E. Product Search & Budget / Category / Sale Discovery
  const priceMatch =
    lower.match(/(?:under|below|less than|max|budget)\s*\$?\s*(\d+)/) ||
    lower.match(/\$\s*(\d+)/);
  const maxPrice = priceMatch ? parseInt(priceMatch[1], 10) : undefined;
  const onlyDiscounted =
    lower.includes("sale") ||
    lower.includes("discount") ||
    lower.includes("deal") ||
    lower.includes("offer");
  const onlyNew = lower.includes("new arrival") || lower.includes("newest") || lower.includes("latest");

  let category = "";
  for (const cat of ["living", "dining", "bedroom", "sofa", "chair", "table", "lamp"]) {
    if (lower.includes(cat)) {
      category = cat;
      break;
    }
  }

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
      onlyDiscounted ? "**on sale**" : "",
      onlyNew ? "from our **new arrivals**" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return {
      reply: `Here are the top Furniro pieces ${
        filterNotes || "handpicked from our catalog"
      }. You can add any item directly to your cart or wishlist from the cards below:`,
      products: collectedProducts,
      aiMode: "smart-local",
    };
  }

  return {
    reply:
      "I can help you discover furniture by room or budget, add items directly to your cart, match styles from a room photo, or track your orders. Try asking *'Show me chairs under $250'* or *'What's on sale?'*",
    aiMode: "smart-local",
  };
}
