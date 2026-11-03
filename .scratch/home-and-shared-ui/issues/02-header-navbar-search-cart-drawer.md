# 02: Header, Navbar, Search Modal, and Cart Drawer Overhaul

Status: resolved
Blocked by: 01

## Objective

Eliminate layout jumps, invalid HTML semantics, duplicate modal mounts, and broken backdrop/Escape events across `Header`, `LgNavbar`, `SmNavbar`, `SearchBox`, `CartItems`, and `ClientAccountInfo`.

## Tasks

1. **`Header.tsx`**:
   - Make header consistently `sticky top-0 z-[1000] bg-white/95 backdrop-blur-md border-b border-gray-100`.
   - Replace `<Link href="/">` on Cart and Account triggers with semantic `<button type="button">` elements.
   - Add dedicated Heart (`/favorites`) link icon with live `favoriteCount` badge from `useFavorites()`.
   - Mount `<SearchBox />` once at the header root level instead of duplicating it inside desktop and mobile blocks.
   - Pass user & order count cleanly to `ClientAccountInfo` to avoid duplicate `/api/account-info` and `/api/order/count` fetches.
2. **`LgNavbar.tsx` & `SmNavbar.tsx`**:
   - Fix valid HTML nesting (`<ul> > <li> > <Link>`).
   - Highlight active route using `usePathname()`.
3. **`SearchBox.tsx`**:
   - Close modal when clicking the backdrop or pressing `Escape`.
   - Show product thumbnail, title, featured subtitle, and price (`$X.XX`) in search results, plus a `"Browse in Shop"` link.
4. **`CartItems.tsx`**:
   - Add inline `-` / `+` quantity buttons using `updateQuantity` from `useCart()`.
   - Format prices cleanly (`$X.XX`) and improve empty-cart UI with a `"Browse Shop"` link.

## Answer

Updated `Header.tsx`, `LgNavbar.tsx`, `SmNavbar.tsx`, `SearchBox.tsx`, `CartItems.tsx`, and `ClientAccountInfo.tsx`.
