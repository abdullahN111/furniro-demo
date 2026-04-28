import { NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/auth/authSetup";

interface OrderItem {
  productId: string;
  price: number;
  quantity: number;
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: "2025-01-13",
  token: process.env.SANITY_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    const body = await req.json();
    const { orderId, user, items, total, paymentMethod } = body;

    const safeUser = {
      ...user,
      email: session.user.email, 
    };
    const productRefs = items.map((item: OrderItem) => ({
      _key: uuidv4(),
      _type: "reference",
      _ref: item.productId,
    }));

    const itemPrices = items.map((item: OrderItem) => item.price);
    const itemQuantities = items.map((item: OrderItem) => item.quantity);

    const orderDoc = {
      _type: "order",
      orderId,
      user: safeUser,
      items: productRefs,

      itemPrices,
      itemQuantities,
      total,
      paymentMethod,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    const createdOrder = await client.create(orderDoc);

    return NextResponse.json(
      { success: true, orderId: createdOrder._id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 },
    );
  }
}
