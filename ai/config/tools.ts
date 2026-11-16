/**
 * Gemini Interactions API Function Calling Tool Definitions
 */

export const FURNIRO_AGENT_TOOLS = [
  {
    type: "function" as const,
    name: "search_products",
    description:
      "Search the live Furniro furniture catalog by keyword, room category, maximum price, discount status, or new arrival status.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search keywords such as 'chair', 'sofa', 'table', 'lamp', 'bed', 'minimalist', 'wood', or a specific product name like 'Syltherine' or 'Respira'.",
        },
        category: {
          type: "string",
          description:
            "Optional room or furniture category: 'living', 'dining', 'bedroom', 'sofa', 'chair', 'table', 'lamp'.",
        },
        maxPrice: {
          type: "number",
          description: "Optional maximum price in USD (after discount).",
        },
        minPrice: {
          type: "number",
          description: "Optional minimum price in USD.",
        },
        onlyDiscounted: {
          type: "boolean",
          description: "Set true if the user asks for sale or discounted items.",
        },
        onlyNew: {
          type: "boolean",
          description: "Set true if the user asks for new arrivals.",
        },
        limit: {
          type: "number",
          description: "Maximum number of products to return (default 4).",
        },
      },
    },
  },
  {
    type: "function" as const,
    name: "manage_cart_or_wishlist",
    description:
      "Add or remove a product from the user's shopping cart or favorites/wishlist, or clear the cart.",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: [
            "ADD_TO_CART",
            "REMOVE_FROM_CART",
            "CLEAR_CART",
            "ADD_TO_FAVORITES",
            "REMOVE_FROM_FAVORITES",
          ],
          description: "The cart or wishlist action to execute on the client.",
        },
        productQuery: {
          type: "string",
          description:
            "Product title or ID to match (e.g., 'Syltherine', 'Leviosa', 'Respira', or the current page product ID).",
        },
        quantity: {
          type: "number",
          description: "Quantity to add to cart (defaults to 1).",
        },
      },
      required: ["action"],
    },
  },
  {
    type: "function" as const,
    name: "track_order",
    description:
      "Look up live order status and delivery progress for the signed-in user or by an explicit Tracking Number / Order ID.",
    parameters: {
      type: "object",
      properties: {
        trackingOrOrderId: {
          type: "string",
          description:
            "Optional tracking number or order ID provided by the user. Leave empty to fetch the signed-in user's recent orders.",
        },
      },
    },
  },
  {
    type: "function" as const,
    name: "get_product_details",
    description:
      "Fetch full details and customer reviews for a specific product by its ID or title, or find complementary pairing items.",
    parameters: {
      type: "object",
      properties: {
        productIdOrTitle: {
          type: "string",
          description: "The product ID or title to inspect.",
        },
        includePairings: {
          type: "boolean",
          description:
            "Whether to also return complementary furniture pieces that pair well with this product.",
        },
      },
      required: ["productIdOrTitle"],
    },
  },
];
