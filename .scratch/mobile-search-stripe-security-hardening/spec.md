# Mobile Search UI, Stripe Payment Security & Cross-Project Consistency Spec

## Scope
1. **Mobile UI/UX Fixes for Search & AI Visual Search (`SearchBox.tsx`, `VisualSearchModal.tsx`, `ShopFilter.tsx`)**:
   - Fix cramped/overflowing mobile layouts in the Header Search Modal and AI Visual Search Modal on small viewports (`320px–640px`).
   - Make `VisualSearchModal` a responsive mobile sheet/modal with compact dropzone, non-overflowing header badges, and touch-friendly matched product cards.
2. **Stripe Payment & Order Flow Hardening (`order.ts`, `/api/payment-intent`, `/api/order`, `checkout/page.tsx`, `PaymentMethod.tsx`, `PaymentDetails.tsx`)**:
   - Authenticate `/api/payment-intent` and compute authoritative order totals on the server from Sanity product prices.
   - Verify `stripePaymentIntentId` server-side via Stripe SDK in `POST /api/order` (`status === "succeeded"` and amount match), prevent replay/duplicate orders, and decrement product `inventoryInStock` in Sanity.
   - Extend Sanity `order` schema with `paid` (`boolean`), `paymentStatus` (`"Pending" | "Paid" | "Failed" | "Refunded"`), and `stripePaymentIntentId` (`string`).
   - Add `GET /api/order` so `orders/page.tsx` fetches user orders via an authenticated server API route instead of importing `serverClient` into a client component.
3. **Security & Data Consistency (`gallery/route.ts`, `track-order/route.ts`, `catalogService.ts`, `ChatbotWidget.tsx`, `middleware.ts`, `next.config.mjs`)**:
   - Require `auth()` on `POST /api/gallery` and bind `userEmail` to `session.user.email`.
   - Use `serverClient` (`useCdn: false`) in `/api/track-order` for real-time status accuracy with the Dashboard Console.
   - Align `dicountPercentage` field name and price math in `ai/services/catalogService.ts` with `src/app/Data/index.ts`, and align the 5-step order status pipeline (`Pending` → `Processing` → `Dispatched` → `Shipped` → `Delivered`) in `ChatbotWidget.tsx`.
   - Add HTTP security headers in `next.config.mjs`.
