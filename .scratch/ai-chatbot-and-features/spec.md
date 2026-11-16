# Furniro AI Suite — Spec (`.scratch/ai-chatbot-and-features/spec.md`)

## Overview
Add an industry-standard e-commerce AI suite to Furniro, housed inside a dedicated root folder (`/ai` mapped to `@ai/*` in `tsconfig.json`):

1. **Floating AI Chatbot Agent (`ai/components/ChatbotWidget.tsx`)**:
   - Persistent bottom-right floating luxury button & expandable chat drawer.
   - **Smart Product Search + Rich Product Cards**: Queries live Sanity products (`search_products` tool) by keyword, category, max price, discount, or new status, and renders interactive product cards in chat with **Add to Cart**, **Favorite**, and **View Product** actions.
   - **Direct Cart & Wishlist Actions**: Executes `add_to_cart`, `remove_from_cart`, `clear_cart`, and `toggle_favorite` client actions directly against `CartContext` and `FavoritesContext` with toast confirmations.
   - **Live Order Tracking in Chat**: Queries Sanity orders by authenticated user session or explicit Tracking ID (`track_order` tool) and renders an inline 5-stage order progress card.
   - **Page-Aware Context (Co-Browsing)**: Automatically detects when the shopper is on `/product/[id]`, fetches that product's live details, and displays a context pill (*"Viewing: [Product Title]"*) with 1-click product-specific prompts.
   - **In-Chat Visual Search Attachment**: Users can attach a room or furniture photo directly in the chatbot to find matching Furniro pieces.

2. **AI Visual Search — "Snap & Style Match" (`ai/components/VisualSearchModal.tsx`)**:
   - Accessible from both the **Header Search Modal (`SearchBox.tsx`)** and the **Shop Filter Bar (`ShopFilter.tsx`)** (plus inside the Chatbot).
   - Users upload or drag-and-drop a photo of a room or furniture item (or pick a sample room inspiration photo).
   - Uses Google Gemini (`gemini-4-hydrogen` via `@google/genai` `client.interactions.create` with inline base64 image input, plus a resilient visual-attribute fallback if `GEMINI_API_KEY` is not set) to detect furniture style, color palette, category, and keywords, returning matched Sanity catalog items with match reasons and 1-click Add to Cart.

3. **AI Review Summary & Product Q&A (`ai/components/ProductAiInsights.tsx`)**:
   - Embedded on `/product/[id]` (`ProductDetail.tsx`) in the Reviews & Insights area (Amazon Rufus style).
   - Synthesizes verified customer reviews into an **AI Customer Review Summary**, **Pros / Highlights tags**, **Sentiment breakdown**, and an interactive **"Ask AI About This Product"** bar with instant quick-question chips (*"Is it good for small spaces?"*, *"How is the build quality?"*, *"What styles pair well with this?"*).

## Model Note
- Per the Gemini API Development standards, `gemini-2.5-flash` is legacy/deprecated; we use `gemini-4-hydrogen` (`DEFAULT_GEMINI_MODEL = "gemini-4-hydrogen"`) with `@google/genai` (`client.interactions.create`) and include a deterministic local intelligence fallback when `GEMINI_API_KEY` is absent so every feature works out-of-the-box in local development and demos.
