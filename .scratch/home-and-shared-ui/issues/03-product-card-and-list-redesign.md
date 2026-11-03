# 03: Shared ProductCard & ProductList Redesign

Status: resolved
Blocked by: 01

## Objective

Redesign `ProductCard` and `ProductList` for an elegant desktop and mobile experience, eliminating N+1 favorite fetches and wiring up Share, Favorite, Add to Cart feedback, and New/Discount badges.

## Tasks

1. **`ProductCard.tsx`**:
   - Remove per-card `useEffect` fetching `/api/favorites?productId=...`; consume `useFavorites()` and `useToast()` instead.
   - Make the product image and title clickable `<Link href={`/add-to-cart/${card.slug.current}`}>` elements.
   - Display both `card.isNew` (`New` emerald badge) and `card.dicountPercentage` (`-X%` coral badge).
   - Provide accessible top-right floating action buttons for **Favorite** (heart toggle with animation) and **Share** (native `navigator.share` fallback to `navigator.clipboard.writeText` + `"Product link copied to clipboard!"` toast).
   - Provide a clear bottom **Add to Cart** button that triggers an `"Added <title> to cart"` toast (with `"View Cart"` action) and disables cleanly when `inventoryInStock <= 0`.
2. **`ProductList.tsx`**:
   - Improve loading skeleton cards to match the new `ProductCard` height and structure.

## Answer

Redesigned `ProductCard.tsx`, `ProductList.tsx`, and synchronized `src/app/favorites/page.tsx` with `useFavorites()`.
