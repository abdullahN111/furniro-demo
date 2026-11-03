# 05: Shop Category Filtering Sync (`/shop?category=...`)

Status: resolved
Blocked by: 03, 04

## Objective

Ensure links from the Home page (`Range` and `Explore` sections) to `/shop?category=<name>` filter the Shop catalog accurately and allow users to switch or clear category filters on `/shop`.

## Tasks

1. **`src/app/shop/page.tsx` & `src/app/components/sections/ShopFilter.tsx`**:
   - Read `category` from URL search params (`useSearchParams` wrapped in `<Suspense>`).
   - Provide category filter pills (`All`, `Dining`, `Living`, `Bedroom`, plus custom query pill) in `ShopFilter`.
   - Filter products matching the selected category/room across `tags`, `featured`, `title`, and `description`, resetting pagination to page 1 when filters change.
   - Fix the `"Showing X of Y products"` counter to display the actual range (`Showing 1–12 of Y results`).

## Answer

Updated `src/app/shop/page.tsx` and `src/app/components/sections/ShopFilter.tsx` with URL-synced category filtering and room keyword mapping.
