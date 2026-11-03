# Spec: Cart, Checkout, Orders, Track Order & Auth Overhaul

## Goal

Eliminate all UI glitches, currency/variant inconsistencies, silent validation/payment errors, and non-standard form events across `/cart`, `/checkout`, `/orders`, `/track-order`, `/login`, and `/create-account`.

## Key Improvements

1. **Cart Page (`src/app/components/sections/Cart.tsx`)**:
   - Add a **Select All** master checkbox in the desktop table header and mobile toolbar.
   - Add a polished **Empty Cart** state when `cartItems.length === 0`.
   - Prevent proceeding to `/checkout` when `selectedItems.length === 0` (disable button & show helpful hint).
   - Format all prices and subtotals consistently as `$X.XX` and add toast feedback on item removal or clear cart.

2. **Checkout Flow (`src/app/checkout/page.tsx`, `PaymentMethod.tsx`, `PaymentDetails.tsx`)**:
   - Guard against empty checkout (`selectedCartItems.length === 0`) with a friendly redirect/CTA back to `/cart` or `/shop`.
   - Fix `react-hook-form` validation messages for Phone and Zip Code so invalid patterns show clear inline error messages.
   - Support dynamic or flexible Country & State/Province selection (including USA, UK, Canada, UAE, Pakistan, India, etc.).
   - Surface Stripe and Order API errors via `useToast()` instead of silent `console.error` calls.
   - Fix the Privacy Policy link in `PaymentDetails.tsx` to point to `/privacy-policy` and show item thumbnails in the Order Summary card.

3. **Orders Page (`src/app/orders/page.tsx`)**:
   - Remove the N+1 `fetchProducts()` call inside each `OrderCard`; fetch products once in the parent `Order` component and pass down.
   - Remove hardcoded clothing placeholder text (`"Color Family: White Black"`, `"Size: Int: LM"`).
   - Fix currency symbol from `Rs.` to `$` (`$X.XX`) to match the rest of the storefront.
   - Replace all `alert()` popups (in review submission and `#FuniroFurniture` gallery creation) with `useToast()`.
   - Make `"Track Order"` and `"Download Receipt PDF"` accessible on both mobile and desktop.

4. **Track Order Page (`src/app/track-order/page.tsx`)**:
   - Wrap `useSearchParams()` in `<Suspense>` and fix the React Hook `router` dependency warning.
   - Replace the jarring popup modal and red close button with an inline luxury **Order Tracking & Receipt Dashboard** featuring a 5-step progress tracker, copyable Order ID button, shipping & payment summary, itemized product list, and downloadable PDF receipt.

5. **Auth Pages (`src/app/login/page.tsx`, `src/app/create-account/page.tsx`)**:
   - Wrap inputs in semantic `<form onSubmit={...}>` so pressing `Enter` submits the form.
   - Add a Show/Hide password toggle and unify both pages into a cohesive two-column luxury layout.

