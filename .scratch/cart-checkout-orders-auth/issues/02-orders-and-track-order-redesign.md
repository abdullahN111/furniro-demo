# 02: Orders & Track Order Redesign

Status: resolved

## Objective

Eliminate N+1 product fetches, fake clothing variant text, `Rs.` currency mismatch, and `alert()` dialogs in `src/app/orders/page.tsx`, and redesign `src/app/track-order/page.tsx` with `<Suspense>`, visual status timeline, copyable Order ID, and PDF receipt generation.

## Answer

Updated `src/app/orders/page.tsx` and `src/app/track-order/page.tsx`.
