/**
 * Furniro AI Suite Constants & Prompts
 * Uses `gemini-3.5-flash-lite` (fastest, lowest-cost current model in the Gemini 3.5/4 family)
 * with compact instructions to minimize token usage and maximize response speed.
 */

export const DEFAULT_GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

export const FURNIRO_AGENT_SYSTEM_INSTRUCTION = `You are the Furniro AI Concierge for a modern furniture store.
Rules:
- Reply in 1–3 concise, warm sentences.
- Use \`search_products\` for furniture discovery, budgets, categories, or sales.
- Use \`manage_cart_or_wishlist\` when asked to add/remove cart items, clear cart, or save to wishlist.
- Use \`track_order\` when asked to track or check an order.
- Use \`get_product_details\` when asked about the currently viewed product or pairings.
- Never list raw product IDs; the UI renders interactive product and order cards automatically.`;

export const DEFAULT_QUICK_PROMPTS = [
  "Show me modern chairs under $250",
  "What's currently on sale?",
  "Recommend pieces for a cozy living room",
  "Track my latest order",
];

export const PRODUCT_PAGE_QUICK_PROMPTS = [
  "Does this fit a small apartment?",
  "What furniture pairs well with this?",
  "Add 1 of this item to my cart",
  "Save this piece to my wishlist",
];

export const SAMPLE_VISUAL_SEARCH_PRESETS = [
  {
    id: "scandi-living",
    label: "Scandinavian Living Room",
    description: "Warm oak wood, neutral linen sofa & minimalist coffee table",
    category: "living",
    style: "Scandinavian Minimalist",
    colors: ["Warm Oak", "Cream Linen", "Soft Beige"],
    keywords: ["sofa", "chair", "table", "living", "minimalist", "wood"],
  },
  {
    id: "modern-dining",
    label: "Mid-Century Dining Space",
    description: "Sculpted wooden dining chairs & warm ambient lighting",
    category: "dining",
    style: "Mid-Century Modern",
    colors: ["Walnut Brown", "Matte Black", "Warm Gold"],
    keywords: ["dining", "chair", "table", "wood", "vintage", "lamp"],
  },
  {
    id: "serene-bedroom",
    label: "Serene Boutique Bedroom",
    description: "Plush upholstered bed frame, cozy lounge seating & bedside lamp",
    category: "bedroom",
    style: "Contemporary Luxury",
    colors: ["Ivory", "Taupe", "Muted Brass"],
    keywords: ["bed", "bedroom", "couch", "lamp", "nightstand", "luxury"],
  },
];
