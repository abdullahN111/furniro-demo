import { NextResponse } from "next/server";
import { auth } from "@/auth/authSetup";
import { client } from "@/sanity/lib/client";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID required" },
        { status: 400 },
      );
    }

    const order = await client.fetch(
      `*[_type == "order" && orderId == $orderId && user.email == $email][0]{
    orderId,
    paymentMethod,
    status,
    total,
    items[]->{
      _id,
      title,
      price
    },
    itemQuantities
  }`,
      {
        orderId,
        email: session.user.email,
      },
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
