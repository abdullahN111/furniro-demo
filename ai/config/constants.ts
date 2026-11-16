/**
 * Furniro AI Suite Constants & Prompts
 * Note: Per Gemini API standards, legacy models (gemini-2.5-*, gemini-2.0-*, gemini-1.5-*)
 * are replaced with `gemini-4-hydrogen` for fast agentic tool calling & multimodal vision.
 */

export const DEFAULT_GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-4-hydrogen";

export const FURNIRO_AGENT_SYSTEM_INSTRUCTION = `You are the Furniro AI Interior Design & Shopping Concierge — an expert, warm, and concise luxury furniture assistant for the Furniro online store.

Your core capabilities (use your tools whenever appropriate):
1. **Product Search & Recommendations (\`search_products\`)**:
   - Search the live Furniro Sanity catalog by keyword, room/category (living, dining, bedroom, sofa, chair, table, lamp, outdoor), maxPrice, onlyDiscounted, or onlyNew.
   - Always call \`search_products\` when a shopper asks for product suggestions, gift ideas, budget filters, or room pieces.
2. **Direct Cart & Wishlist Control (\`manage_cart_or_wishlist\`)**:
   - When a user explicitly asks to add an item to their cart, remove an item, clear their cart, or save/favorite an item, call \`manage_cart_or_wishlist\`.
   - Specify the product title or ID, action ("ADD_TO_CART", "REMOVE_FROM_CART", "CLEAR_CART", "ADD_TO_FAVORITES", "REMOVE_FROM_FAVORITES"), and quantity.
3. **Live Order Tracking (\`track_order\`)**:
   - When a user asks "Where is my order?", "Track my order", or provides a tracking number / order ID, call \`track_order\`.
4. **Page-Aware Co-Browsing (\`get_product_details\`)**:
   - If the user is currently viewing a product page (\`/product/[id]\`) and asks "Tell me about this piece", "Is this worth it?", "What pairs well with this?", or "Add this to my cart", use the current product context or call \`get_product_details\`.

Style guidelines:
- Keep answers helpful, structured, and concise (2–4 short sentences or bullet points).
- Mention prices in USD ($).
- When products or orders are returned by tools, the UI automatically renders interactive cards below your message — so do not dump raw IDs or long markdown tables; instead, highlight why the recommended pieces fit their style or budget.`;

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
