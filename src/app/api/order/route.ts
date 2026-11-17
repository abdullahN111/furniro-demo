import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";
import { auth } from "@/auth/authSetup";
import { serverClient } from "@/sanity/lib/serverClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

interface OrderItemInput {
  productId: string;
  price: number;
  quantity: number;
}

interface SanityProductDoc {
  _id: string;
  title: string;
  price: number;
  inventoryInStock?: number;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", orders: [] },
        { status: 401 }
      );
    }

    const userEmail = session.user.email.trim().toLowerCase();

    const orders = await serverClient.fetch(
      `*[_type == "order" && lower(user.email) == $userEmail] | order(createdAt desc){
        _id,
        orderId,
        user,
        "items": items[]->{
          _id,
          title,
          "productImage": productImage.asset->url,
          price
        },
        itemPrices,
        itemQuantities,
        total,
        status,
        dispatchedAt,
        paymentMethod,
        paid,
        paymentStatus,
        stripePaymentIntentId,
        createdAt
      }`,
      { userEmail }
    );

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders", orders: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      orderId,
      user,
      items,
      paymentMethod: rawPaymentMethod,
      stripePaymentIntentId,
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Order must contain at least one item." },
        { status: 400 }
      );
    }

    const cleanOrderId =
      typeof orderId === "string" && orderId.trim()
        ? orderId.trim()
        : uuidv4().slice(0, 8);

    const normalizedMethod =
      rawPaymentMethod === "Stripe" ? "Stripe" : "Cash On Delivery";

    // Fetch authoritative product prices and stock from Sanity
    const productIds = items.map((i: OrderItemInput) => i.productId);
    const sanityProducts = await serverClient.fetch<SanityProductDoc[]>(
      `*[_type == "product" && _id in $ids]{
        _id,
        title,
        price,
        inventoryInStock
      }`,
      { ids: productIds }
    );

    const productMap = new Map(
      (sanityProducts || []).map((p) => [p._id, p])
    );

    const verifiedItemPrices: number[] = [];
    const verifiedQuantities: number[] = [];
    let verifiedTotal = 0;

    for (const item of items as OrderItemInput[]) {
      const dbProduct = productMap.get(item.productId);
      const qty = Math.max(1, Math.round(Number(item.quantity) || 1));

      if (!dbProduct) {
        return NextResponse.json(
          {
            success: false,
            message: "One or more items in your cart are no longer available.",
          },
          { status: 400 }
        );
      }

      if (
        typeof dbProduct.inventoryInStock === "number" &&
        dbProduct.inventoryInStock < qty
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `"${dbProduct.title}" only has ${dbProduct.inventoryInStock} unit(s) left in stock.`,
          },
          { status: 400 }
        );
      }

      const authoritativePrice = Number(dbProduct.price) || Number(item.price) || 0;
      verifiedItemPrices.push(authoritativePrice);
      verifiedQuantities.push(qty);
      verifiedTotal += authoritativePrice * qty;
    }

    // If paid via Stripe, verify the PaymentIntent directly with Stripe API
    let isPaid = false;
    let paymentStatus: "Pending" | "Paid" = "Pending";

    if (normalizedMethod === "Stripe") {
      if (!stripePaymentIntentId || typeof stripePaymentIntentId !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Missing Stripe payment confirmation ID.",
          },
          { status: 400 }
        );
      }

      // Prevent duplicate order creation with the same PaymentIntent
      const existingOrder = await serverClient.fetch(
        `*[_type == "order" && stripePaymentIntentId == $piId][0]{ _id, orderId }`,
        { piId: stripePaymentIntentId }
      );
      if (existingOrder) {
        return NextResponse.json(
          {
            success: true,
            orderId: existingOrder.orderId,
            sanityId: existingOrder._id,
          },
          { status: 200 }
        );
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(
        stripePaymentIntentId
      );

      if (paymentIntent.status !== "succeeded") {
        return NextResponse.json(
          {
            success: false,
            message: `Stripe payment is not completed (status: ${paymentIntent.status}).`,
          },
          { status: 400 }
        );
      }

      const expectedCents = Math.max(50, Math.round(verifiedTotal * 100));
      if (Math.abs(paymentIntent.amount - expectedCents) > 100) {
        return NextResponse.json(
          {
            success: false,
            message: "Payment amount mismatch detected. Please contact support.",
          },
          { status: 400 }
        );
      }

      isPaid = true;
      paymentStatus = "Paid";
    }

    const safeUser = {
      firstname: String(user?.firstname || "").trim(),
      lastname: String(user?.lastname || "").trim(),
      email: session.user.email.trim().toLowerCase(),
      phone: String(user?.phone || "").trim(),
      streetaddress: String(user?.streetaddress || "").trim(),
      city: String(user?.city || "").trim(),
      province: String(user?.province || "").trim(),
      zipcode: String(user?.zipcode || "").trim(),
      country: String(user?.country || "").trim(),
    };

    const productRefs = (items as OrderItemInput[]).map((item) => ({
      _key: uuidv4(),
      _type: "reference",
      _ref: item.productId,
    }));

    const orderDoc = {
      _type: "order",
      orderId: cleanOrderId,
      user: safeUser,
      items: productRefs,
      itemPrices: verifiedItemPrices,
      itemQuantities: verifiedQuantities,
      total: Math.round(verifiedTotal * 100) / 100,
      paymentMethod: normalizedMethod,
      paid: isPaid,
      paymentStatus,
      ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    const createdOrder = await serverClient.create(orderDoc);

    // Decrement product inventory in Sanity
    await Promise.allSettled(
      (items as OrderItemInput[]).map((item, idx) => {
        const dbProduct = productMap.get(item.productId);
        if (!dbProduct || typeof dbProduct.inventoryInStock !== "number") {
          return Promise.resolve();
        }
        const nextStock = Math.max(
          0,
          dbProduct.inventoryInStock - verifiedQuantities[idx]
        );
        return serverClient
          .patch(dbProduct._id)
          .set({ inventoryInStock: nextStock })
          .commit();
      })
    );

    return NextResponse.json(
      {
        success: true,
        orderId: cleanOrderId,
        sanityId: createdOrder._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}
