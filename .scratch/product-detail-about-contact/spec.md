# Spec: Product Detail Route (`/product/[id]`), Luxury Product & Reviews Redesign, and About/Contact Overhaul

## Goal

1. Replace the misnamed `/add-to-cart/[id]` route with `/product/[id]` across the entire storefront while preserving backwards compatibility via automatic redirect on `/add-to-cart/[id]`.
2. Transform the Product Detail page (`ProductHeader` + `ProductDetail`) and its **Customer Reviews** section into an elegant, modern luxury furniture experience with rating distribution bars, verified purchase badges, star filtering/sorting, inline review submission for eligible delivered orders, and related products.
3. Redesign the **About** (`/about`) and **Contact** (`/contact`) pages to match Furniro's warm gold/cream aesthetic (`#B88E2F`, `#F9F1E7`, `#FCF8F3`) with working CTAs, validated forms, and toast notifications.

## Key Decisions (From Grilling)

1. **Canonical Route `/product/[id]` with Safe Redirect**:
   - Create `src/app/product/[id]/page.tsx`.
   - Convert `src/app/add-to-cart/[id]/page.tsx` to redirect (`redirect(\`/product/\${params.id}\`)`) so old links, bookmarks, or shared URLs never break.
   - Update all internal `<Link>` references in `ProductCard.tsx`, `SearchBox.tsx`, `Cart.tsx`, and `orders/page.tsx` to point to `/product/${slug}`.

2. **Luxury Product Detail & Reviews Redesign (`ProductHeader.tsx`, `ProductDetail.tsx`, `api/reviews/route.ts`)**:
   - **Clickable Breadcrumbs**: `Home` -> `Shop` -> `Product Title` with real `<Link>` navigation.
   - **Interactive Image Gallery**: Multi-angle/crop preview modes (Full View, Detail Zoom, Warm Studio, Room Context) + interactive lightbox zoom toggle so the 4 side thumbnails provide distinct visual perspectives instead of static duplicates.
   - **Product Info & Actions**:
     - Price + old price + discount/new badges + live rating summary link.
     - Quantity selector capped at `inventoryInStock`, `"Add to Cart"` (with toast & `"View Cart"` action), and `"Buy Now"` (adds to cart and navigates directly to `/cart` or `/checkout`).
     - Connected Favorite button (`useFavorites()`) and Share button (Web Share API / clipboard copy with toast).
     - Trust & delivery highlights (Free Shipping, 2-Year Craftsmanship Warranty, 30-Day Returns).
   - **Tabbed Content & Upgraded Reviews Dashboard**:
     - Tabs for **Overview & Specifications** and **Customer Reviews (`reviewCount`)**.
     - **Rating Summary Card**: Large average rating score, 5★ to 1★ progress bar distribution, star-rating filter pills (`All`, `5★`, `4★`, `3★`, `2★`, `1★`), and sort control (`Newest`, `Highest Rating`, `Lowest Rating`).
     - **Rich Review Cards**: Reviewer avatar initial badge, reviewer name, `"Verified Purchase"` badge, formatted date, star display, and comment.
     - **Inline `"Write a Review"` Experience**: Checks if the signed-in user has a delivered order containing this product that hasn't been reviewed yet (via `GET /api/reviews?productId=...&checkEligibility=true`), allowing them to submit a review directly on the product page, or showing a helpful status/CTA linking to `/orders`.
   - **Related Products Section**: Displays up to 4 related products (matching tags/category) at the bottom of the page with a `"View More in Shop"` button.

3. **About & Contact Pages Overhaul (`about/page.tsx`, `contact/page.tsx`, `ContactForm.tsx`, `ContactInfo.tsx`)**:
   - **About Page (`/about`)**: Replace clashing blue/pink gradients with Furniro's warm gold/cream luxury theme, replace emoji icons with crisp vector icons, use distinct imagery for Story vs Mission, and wire `"Explore Our Collections"` (`/shop`) and `"Book a Consultation"` (`/contact`) links.
   - **Contact Page (`/contact`)**: Add `<SecondaryHeader routeName="Contact" />` and `<ServiceBar />`, upgrade `ContactInfo` with interactive cards & showroom hours, and make `ContactForm` a controlled, validated form with loading state, toast confirmation, and quick FAQ cards.

