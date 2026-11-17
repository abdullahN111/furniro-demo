# 02: Stripe Payment Server-Side Verification, Order Schema & Stock Decrement

Status: resolved

## Objective
Harden `/api/payment-intent` and `/api/order` with server-side Sanity price calculation, Stripe PaymentIntent verification, `paid`/`paymentStatus`/`stripePaymentIntentId` fields in Sanity `order` schema, inventory decrement, and `GET /api/order` for `orders/page.tsx`.
