# 01: Canonical `/product/[id]` Route & Backwards-Compatible Redirect

Status: resolved

## Objective

Create the `/product/[id]` route, redirect `/add-to-cart/[id]` to `/product/[id]`, and update all internal product links across the storefront.

## Answer

Created `src/app/product/[id]/page.tsx`, converted `src/app/add-to-cart/[id]/page.tsx` into a redirect to `/product/${params.id}`, and updated all internal links in `ProductCard.tsx`, `SearchBox.tsx`, `Cart.tsx`, and `orders/page.tsx`.
