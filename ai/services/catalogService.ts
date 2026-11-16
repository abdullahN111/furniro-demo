import { client } from "@/sanity/lib/client";
import { AiOrderSummary, AiProductCard } from "@ai/types";

interface RawSanityProduct {
  _id: string;
  title: string;
  price: number;
  discountPercentage?: number;
  isNew?: boolean;
  tags?: string[];
  description?: string;
  imageUrl?: string;
}

interface RawSanityOrder {
  _id: string;
  orderId: string;
  paymentMethod?: string;
  status?: string;
  total?: number;
  createdAt?: string;
  items?: {
    _id: string;
    title: string;
    price: number;
    imageUrl?: string;
  }[];
  itemQuantities?: number[];
  itemPrices?: number[];
}

export interface RawSanityReview {
  _id: string;
  rating: number;
  comment: string;
  userName?: string;
  createdAt?: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  living: ["sofa", "couch", "living", "lounge", "set", "chair", "coffee", "table", "mug", "potty"],
  dining: ["dining", "table", "chair", "cafe", "stool", "mug", "wooden"],
  bedroom: ["bed", "bedroom", "night", "lamp", "light", "pillow", "couch", "restful"],
  sofa: ["sofa", "couch", "set", "sectional", "loveseat"],
  chair: ["chair", "stool", "seat", "armchair", "cafe"],
  table: ["table", "desk", "dining", "outdoor", "stool"],
  lamp: ["lamp", "light", "night"],
};

export function toAiProductCard(
  raw: RawSanityProduct,
  matchReason?: string
): AiProductCard {
  const discount = raw.discountPercentage || 0;
  const finalPrice =
    discount > 0
      ? Math.round(raw.price - (raw.price * discount) / 100)
      : raw.price;

  return {
    id: raw._id,
    title: raw.title,
    price: raw.price,
    discountPercentage: discount,
    finalPrice,
    imageUrl: raw.imageUrl || "/placeholder.svg",
    isNew: Boolean(raw.isNew),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    description: raw.description || "",
    matchReason,
  };
}

export async function fetchAllCatalogProducts(): Promise<AiProductCard[]> {
  try {
    const rawProducts = await client.fetch<RawSanityProduct[]>(
      `*[_type == "product"]{
        _id,
        title,
        price,
        discountPercentage,
        isNew,
        tags,
        description,
        "imageUrl": productImage.asset->url
      }`
    );
    return (rawProducts || []).map((p) => toAiProductCard(p));
  } catch (err) {
    console.error("Failed to fetch catalog products for AI:", err);
    return [];
  }
}

export interface SearchProductsParams {
  query?: string;
  category?: string;
  maxPrice?: number;
  minPrice?: number;
  onlyDiscounted?: boolean;
  onlyNew?: boolean;
  limit?: number;
}

export async function searchCatalogProducts(
  params: SearchProductsParams
): Promise<AiProductCard[]> {
  const allProducts = await fetchAllCatalogProducts();
  if (allProducts.length === 0) return [];

  const {
    query = "",
    category = "",
    maxPrice,
    minPrice,
    onlyDiscounted = false,
    onlyNew = false,
    limit = 4,
  } = params;

  const qLower = query.trim().toLowerCase();
  const catLower = category.trim().toLowerCase();
  const queryTokens = qLower
    .split(/[\s,.-]+/)
    .filter((t) => t.length > 1 && !["the", "and", "for", "with", "show", "me", "some", "find"].includes(t));

  const catKeywords = CATEGORY_KEYWORDS[catLower] || (catLower ? [catLower] : []);

  const scored = allProducts
    .filter((product) => {
      if (typeof maxPrice === "number" && maxPrice > 0 && product.finalPrice > maxPrice) {
        return false;
      }
      if (typeof minPrice === "number" && minPrice > 0 && product.finalPrice < minPrice) {
        return false;
      }
      if (onlyDiscounted && product.discountPercentage <= 0) {
        return false;
      }
      if (onlyNew && !product.isNew) {
        return false;
      }
      return true;
    })
    .map((product) => {
      let score = 0;
      const haystack = `${product.title} ${product.tags.join(" ")} ${product.description || ""}`.toLowerCase();
      const titleLower = product.title.toLowerCase();

      if (qLower && titleLower.includes(qLower)) {
        score += 15;
      }

      for (const token of queryTokens) {
        const stem = token.endsWith("s") && token.length > 3 ? token.slice(0, -1) : token;
        if (titleLower.includes(stem)) score += 8;
        if (product.tags.some((t) => t.toLowerCase().includes(stem))) score += 6;
        if (haystack.includes(stem)) score += 3;
      }

      for (const ck of catKeywords) {
        if (titleLower.includes(ck)) score += 5;
        if (product.tags.some((t) => t.toLowerCase().includes(ck))) score += 4;
        if (haystack.includes(ck)) score += 2;
      }

      if (onlyDiscounted && product.discountPercentage > 0) {
        score += product.discountPercentage / 10;
      }
      if (onlyNew && product.isNew) {
        score += 4;
      }

      return { product, score };
    });

  const hasSearchIntent = queryTokens.length > 0 || catKeywords.length > 0;
  const matched = hasSearchIntent
    ? scored.filter((item) => item.score > 0)
    : scored;

  const finalPool = matched.length > 0 ? matched : scored;

  finalPool.sort((a, b) => b.score - a.score || a.product.finalPrice - b.product.finalPrice);

  return finalPool.slice(0, Math.max(1, Math.min(limit, 8))).map((item) => item.product);
}

export async function findProductByQueryOrId(
  productIdOrTitle?: string
): Promise<AiProductCard | null> {
  if (!productIdOrTitle) return null;
  const allProducts = await fetchAllCatalogProducts();
  const target = productIdOrTitle.trim().toLowerCase();

  // Exact ID or exact title match first
  const exact = allProducts.find(
    (p) => p.id.toLowerCase() === target || p.title.toLowerCase() === target
  );
  if (exact) return exact;

  // Substring title match
  const partial = allProducts.find(
    (p) =>
      p.title.toLowerCase().includes(target) ||
      target.includes(p.title.toLowerCase())
  );
  if (partial) return partial;

  // Fallback to searchCatalogProducts top hit
  const searched = await searchCatalogProducts({ query: productIdOrTitle, limit: 1 });
  return searched[0] || null;
}

export async function getComplementaryProducts(
  baseProduct: AiProductCard,
  limit = 3
): Promise<AiProductCard[]> {
  const allProducts = await fetchAllCatalogProducts();
  const baseTags = new Set(baseProduct.tags.map((t) => t.toLowerCase()));

  const scored = allProducts
    .filter((p) => p.id !== baseProduct.id)
    .map((p) => {
      let score = 0;
      for (const tag of p.tags) {
        if (baseTags.has(tag.toLowerCase())) score += 4;
      }
      // Price harmony bonus
      const priceDiffRatio =
        Math.abs(p.finalPrice - baseProduct.finalPrice) /
        Math.max(baseProduct.finalPrice, 1);
      if (priceDiffRatio < 0.6) score += 2;
      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => ({
    ...s.product,
    matchReason: `Pairs harmoniously with ${baseProduct.title}`,
  }));
}

export async function getProductReviewsForAi(
  productId: string
): Promise<RawSanityReview[]> {
  try {
    const reviews = await client.fetch<RawSanityReview[]>(
      `*[_type == "review" && product._ref == $productId] | order(createdAt desc)[0...20]{
        _id,
        rating,
        comment,
        userName,
        createdAt
      }`,
      { productId }
    );
    return reviews || [];
  } catch (err) {
    console.error("Failed to fetch product reviews for AI:", err);
    return [];
  }
}

export async function lookupOrdersForAi(options: {
  userEmail?: string | null;
  trackingOrOrderId?: string | null;
}): Promise<AiOrderSummary[]> {
  try {
    const { userEmail, trackingOrOrderId } = options;
    const cleanId = trackingOrOrderId?.trim().replace(/^#/, "");

    let rawOrders: RawSanityOrder[] = [];

    if (cleanId) {
      rawOrders = await client.fetch<RawSanityOrder[]>(
        `*[_type == "order" && (orderId == $cleanId || _id == $cleanId)] | order(createdAt desc)[0...3]{
          _id,
          orderId,
          paymentMethod,
          status,
          total,
          createdAt,
          items[]->{
            _id,
            title,
            price,
            "imageUrl": productImage.asset->url
          },
          itemQuantities,
          itemPrices
        }`,
        { cleanId }
      );
    } else if (userEmail) {
      rawOrders = await client.fetch<RawSanityOrder[]>(
        `*[_type == "order" && lower(user.email) == $email] | order(createdAt desc)[0...3]{
          _id,
          orderId,
          paymentMethod,
          status,
          total,
          createdAt,
          items[]->{
            _id,
            title,
            price,
            "imageUrl": productImage.asset->url
          },
          itemQuantities,
          itemPrices
        }`,
        { email: userEmail.trim().toLowerCase() }
      );
    }

    return (rawOrders || []).map((order) => {
      const items = (order.items || []).map((item, idx) => ({
        productId: item?._id || `item-${idx}`,
        title: item?.title || "Furniro Piece",
        quantity: order.itemQuantities?.[idx] || 1,
        price: order.itemPrices?.[idx] ?? item?.price ?? 0,
        imageUrl: item?.imageUrl,
      }));

      return {
        orderId: order.orderId || order._id,
        trackingNumber: order.orderId || order._id,
        orderStatus: order.status || "Pending",
        paymentStatus:
          order.paymentMethod === "cod" && order.status !== "Delivered"
            ? "Pay on Delivery"
            : "Paid",
        paymentMethod: order.paymentMethod || "stripe",
        totalPrice: order.total || 0,
        createdAt: order.createdAt || new Date().toISOString(),
        items,
      };
    });
  } catch (err) {
    console.error("Error looking up orders for AI:", err);
    return [];
  }
}
