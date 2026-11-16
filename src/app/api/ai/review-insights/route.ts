import { NextResponse } from "next/server";
import { generateProductReviewInsights } from "@ai/services/reviewInsightsEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, question } = body || {};

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    const result = await generateProductReviewInsights({
      productId,
      question,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("AI Review Insights Route Error:", error);
    return NextResponse.json(
      { error: "Failed to generate product review insights." },
      { status: 500 }
    );
  }
}
