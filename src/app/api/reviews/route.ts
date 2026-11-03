import { NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { auth } from "@/auth/authSetup";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, productId, rating, comment, userName } = body;

    if (!orderId || !productId) {
      return NextResponse.json(
        { error: "Missing orderId or productId" },
        { status: 400 }
      );
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const userEmail = session.user.email;

    const order = await client.fetch(
      `*[_type == "order" && orderId == $orderId][0]{
        orderId,
        status,
        "userEmail": user.email,
        "productIds": items[]._ref
      }`,
      { orderId }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.userEmail !== userEmail) {
      return NextResponse.json(
        { error: "This order does not belong to you" },
        { status: 403 }
      );
    }
    if (order.status !== "Delivered") {
      return NextResponse.json(
        { error: "You can only review delivered orders" },
        { status: 400 }
      );
    }
    if (!order.productIds?.includes(productId)) {
      return NextResponse.json(
        { error: "This product is not part of this order" },
        { status: 400 }
      );
    }

    const existing = await client.fetch(
      `*[_type == "review" && orderId == $orderId && userEmail == $userEmail && product._ref == $productId][0]{ _id }`,
      { orderId, userEmail, productId }
    );
    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this item" },
        { status: 409 }
      );
    }

    const reviewDoc = {
      _type: "review",
      product: { _type: "reference", _ref: productId },
      orderId,
      userEmail,
      userName: userName || session.user.name || "Verified Customer",
      rating,
      comment: comment || "",
      createdAt: new Date().toISOString(),
    };

    const created = await client.create(reviewDoc);

    return NextResponse.json(
      { success: true, reviewId: created._id, review: { ...reviewDoc, _id: created._id } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const productId = searchParams.get("productId");

    if (productId) {
      const [reviews, session] = await Promise.all([
        client.fetch(
          `*[_type == "review" && product._ref == $productId] | order(createdAt desc){
            _id,
            userName,
            rating,
            comment,
            createdAt
          }`,
          { productId },
          { cache: "no-store" }
        ),
        auth(),
      ]);

      const count = reviews.length;
      const average =
        count > 0
          ? reviews.reduce(
              (sum: number, r: { rating: number }) => sum + r.rating,
              0
            ) / count
          : 0;

      let eligibleOrder: { orderId: string; userName: string } | null = null;
      let hasReviewed = false;

      if (session?.user?.email) {
        const userEmail = session.user.email;
        const [deliveredOrders, userReviews] = await Promise.all([
          client.fetch(
            `*[_type == "order" && user.email == $userEmail && status == "Delivered" && $productId in items[]._ref]{
              orderId,
              "firstName": user.firstname,
              "lastName": user.lastname
            }`,
            { userEmail, productId },
            { cache: "no-store" }
          ),
          client.fetch(
            `*[_type == "review" && userEmail == $userEmail && product._ref == $productId]{
              orderId
            }`,
            { userEmail, productId },
            { cache: "no-store" }
          ),
        ]);

        const reviewedOrderIds = new Set(
          (userReviews || []).map((r: { orderId: string }) => r.orderId)
        );
        hasReviewed = reviewedOrderIds.size > 0;

        const unreviewedOrder = (deliveredOrders || []).find(
          (o: { orderId: string }) => !reviewedOrderIds.has(o.orderId)
        );

        if (unreviewedOrder) {
          const fullName =
            `${unreviewedOrder.firstName || ""} ${unreviewedOrder.lastName || ""}`.trim() ||
            session.user.name ||
            "Verified Customer";
          eligibleOrder = {
            orderId: unreviewedOrder.orderId,
            userName: fullName,
          };
        }
      }

      return NextResponse.json({
        reviews,
        average: Math.round(average * 10) / 10,
        count,
        eligibleOrder,
        hasReviewed,
      });
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId or productId is required" },
        { status: 400 }
      );
    }

    const reviews = await client.fetch(
      `*[_type == "review" && orderId == $orderId && userEmail == $userEmail]{
        _id,
        "productId": product._ref,
        rating,
        comment,
        createdAt
      }`,
      { orderId, userEmail: session.user.email },
      { cache: "no-store" }
    );

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
