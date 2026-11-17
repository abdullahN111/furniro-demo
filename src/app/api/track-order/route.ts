import { NextResponse } from "next/server";
import { auth } from "@/auth/authSetup";
import { serverClient } from "@/sanity/lib/serverClient";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId } = await req.json();
    const cleanOrderId =
      typeof orderId === "string" ? orderId.trim().replace(/^#/, "") : "";

    if (!cleanOrderId) {
      return NextResponse.json(
        { success: false, message: "Order ID required" },
        { status: 400 }
      );
    }

    const order = await serverClient.fetch(
      `*[_type == "order" && (orderId == $orderId || _id == $orderId) && lower(user.email) == $email][0]{
        orderId,
        paymentMethod,
        paid,
        paymentStatus,
        stripePaymentIntentId,
        status,
        dispatchedAt,
        createdAt,
        total,
        items[]->{
          _id,
          title,
          price
        },
        itemPrices,
        itemQuantities
      }`,
      {
        orderId: cleanOrderId,
        email: session.user.email.trim().toLowerCase(),
      }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Track order error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
