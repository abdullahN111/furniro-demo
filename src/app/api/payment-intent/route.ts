import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth/authSetup";
import { serverClient } from "@/sanity/lib/serverClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const items: CheckoutItemInput[] = Array.isArray(body.items)
      ? body.items
      : [];
    let verifiedAmount = Number(body.amount) || 0;

    // If items are provided, compute the authoritative order total from Sanity product prices
    if (items.length > 0) {
      const productIds = items.map((i) => i.productId).filter(Boolean);
      const sanityProducts = await serverClient.fetch<
        Array<{ _id: string; price: number; inventoryInStock?: number }>
      >(
        `*[_type == "product" && _id in $ids]{
          _id,
          price,
          inventoryInStock
        }`,
        { ids: productIds }
      );

      const priceMap = new Map(
        (sanityProducts || []).map((p) => [p._id, Number(p.price) || 0])
      );

      let calculatedTotal = 0;
      for (const item of items) {
        const unitPrice = priceMap.get(item.productId);
        const qty = Math.max(1, Math.round(Number(item.quantity) || 1));
        if (typeof unitPrice === "number" && unitPrice > 0) {
          calculatedTotal += unitPrice * qty;
        }
      }

      if (calculatedTotal > 0) {
        verifiedAmount = calculatedTotal;
      }
    }

    if (!verifiedAmount || verifiedAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid order amount" },
        { status: 400 }
      );
    }

    const amountInCents = Math.max(50, Math.round(verifiedAmount * 100));

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userEmail: session.user.email.toLowerCase(),
        source: "furniro-storefront",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      verifiedAmount,
    });
  } catch (error: unknown) {
    console.error("Stripe PaymentIntent error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
