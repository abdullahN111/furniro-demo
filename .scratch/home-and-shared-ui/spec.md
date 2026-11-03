# Spec: Home Page & Shared UI/UX Overhaul

## Goal

Elevate the visual elegance, responsiveness, interaction standards, and state architecture of the Furniro Home page (`/`) and shared components (`Header`, `LgNavbar`, `SmNavbar`, `SearchBox`, `CartItems`, `ClientAccountInfo`, `Footer`, `ProductCard`, `ProductList`, and `/shop` category links).

## Key Decisions (From Grilling)

1. **SSR & Global Providers (`CartContext`, `ToastContext`, `FavoritesContext`)**:
   - Remove `if (!isMounted) return null;` from `CartContext` so Server-Side Rendering (SSR) renders the full page immediately without a blank white flash.
   - Add a lightweight, elegant `ToastProvider` (`ToastContext.tsx`) supporting success, info, error, and action link buttons (e.g., `"Sign in"` -> `/login`).
   - Add `FavoritesProvider` (`FavoritesContext.tsx`) that fetches the logged-in user's favorite product IDs once per session (`GET /api/favorites`) and exposes `favoriteIds`, `favoriteCount`, `isFavorite(id)`, and `toggleFavorite(id)` with optimistic updates and unauthenticated toast prompt (`"Please sign in to save favorites"` with a `/login` action button). This eliminates the N+1 `GET /api/favorites?productId=...` requests on `ProductCard` and keeps the `Header` badge in sync immediately.

2. **Header, Navigation, Search & Drawers (`Header`, `LgNavbar`, `SmNavbar`, `SearchBox`, `CartItems`, `ClientAccountInfo`)**:
   - **Always Sticky Header**: Keep `Header` consistently `sticky top-0 z-[1000]` with `bg-white/95 backdrop-blur-md border-b border-gray-100` instead of jumping between `relative` and `sticky` when cart items change.
   - **Semantic HTML & Active Links**: Replace `<Link href="/">` + `e.preventDefault()` on Cart and Account triggers with accessible `<button type="button">` elements. Fix `<ul> > <li> > <Link>` hierarchy in `LgNavbar` and `SmNavbar` and highlight the active route with `#B88E2F` and an underline indicator.
   - **Dedicated Favorites Icon in Header**: Add a Heart icon link (`/favorites`) with a live `favoriteCount` badge in the header alongside Search, Cart, and Account.
   - **Single-Mount `SearchBox` with Rich Results**: Render `SearchBox` once at the header root, close on backdrop click or `Escape` key, cache product list, and display product thumbnails, title, featured/category tag, and price in search results.
   - **Interactive `CartItems` Drawer**: Add inline `-` / `+` quantity controls, proper `$X.XX` formatting, Escape/backdrop close, and smooth slide-over animation.

3. **Shared `ProductCard` & `ProductList` Redesign**:
   - **Mobile & Desktop Accessible Layout**: Clicking the product image or title navigates directly to `/add-to-cart/[slug]`.
   - **Top Badges & Floating Action Buttons**:
     - Left badges: Discount badge (`-X%`) and `New` badge (`card.isNew`).
     - Top-right floating buttons (always accessible on mobile and desktop): Favorite Heart button (synced via `FavoritesContext`) and Share button (uses native Web Share API when supported or copies product URL to clipboard + shows `"Link copied to clipboard!"` toast).
   - **Bottom Card Footer & Add to Cart**: Clear price + strikethrough old price, stock indicator badge, and a responsive `"Add to Cart"` button (shows toast confirmation on click; disabled & styled as `"Out of Stock"` when `inventoryInStock <= 0`).

4. **Home Page Sections & Footer Polish (`Hero`, `Range`, `Explore`, `CollectionSetup`, `Footer`)**:
   - **`Hero`**: Replace deprecated `objectFit="cover"` with `className="object-cover"`, refine mobile spacing/margins, and add smooth hover transitions.
   - **`Range` (`Browse The Range`)**: Replace `"Lorem ipsum..."` subtitle with real curated copy and make `Dining`, `Living`, and `Bedroom` cards clickable `<Link href="/shop?category=...">` cards with smooth image zoom.
   - **`Explore` (`50+ Beautiful rooms inspiration`)**: Wire `"Explore More"` to `/shop`, add auto-play (pausing on hover), keyboard/swipe-friendly controls, and make the active slide caption card link to `/shop?category=...`.
   - **`CollectionSetup` (`#FuniroFurniture`)**: Polish gallery grid hover effects and PDF download button states.
   - **`Footer`**: Convert Newsletter `"Subscribe"` `<Link href="/">` into a real `<form>` with email validation and toast confirmation.

5. **Shop Category Filtering (`src/app/shop/page.tsx` & `ShopFilter.tsx`)**:
   - Support `?category=` query parameter on `/shop` (matching category/room against product `tags`, `featured`, `title`, or `description`, plus interactive category filter pills in `ShopFilter`) so clicking `Dining`, `Living`, or `Bedroom` on the Home page filters `/shop` seamlessly.

