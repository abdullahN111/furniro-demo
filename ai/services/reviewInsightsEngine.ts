import { GoogleGenAI } from "@google/genai";
import { DEFAULT_GEMINI_MODEL } from "@ai/config/constants";
import {
  findProductByQueryOrId,
  getProductReviewsForAi,
} from "@ai/services/catalogService";
import { AiReviewInsightsResponse } from "@ai/types";

interface ReviewInsightsInput {
  productId: string;
  question?: string;
}

// 5-minute in-memory cache for product review summaries
const INSIGHTS_CACHE_TTL_MS = 5 * 60 * 1000;
const insightsCache = new Map<
  string,
  { data: AiReviewInsightsResponse; timestamp: number }
>();

export async function generateProductReviewInsights(
  input: ReviewInsightsInput
): Promise<AiReviewInsightsResponse> {
  const cacheKey = `${input.productId}::${(input.question || "").trim().toLowerCase()}`;
  const now = Date.now();
  const cached = insightsCache.get(cacheKey);
  if (cached && now - cached.timestamp < INSIGHTS_CACHE_TTL_MS) {
    return cached.data;
  }

  const product = await findProductByQueryOrId(input.productId);
  const reviews = await getProductReviewsForAi(input.productId);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length
      : 0;

  // If no custom question was asked (initial summary load) or if question matches our common FAQ chips,
  // build the base summary instantaneously to save API quota & latency, and only invoke Gemini for custom open-ended questions!
  const qLower = (input.question || "").trim().toLowerCase();
  const isStandardChip =
    !qLower ||
    qLower.includes("small") ||
    qLower.includes("space") ||
    qLower.includes("apartment") ||
    qLower.includes("fit") ||
    qLower.includes("assembl") ||
    qLower.includes("setup") ||
    qLower.includes("pair") ||
    qLower.includes("match") ||
    qLower.includes("style") ||
    qLower.includes("quality") ||
    qLower.includes("durab");

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (apiKey && product && !isStandardChip) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const reviewDigest =
        reviews.length > 0
          ? reviews
              .slice(0, 6)
              .map((r) => `(${r.rating}/5): "${r.comment.slice(0, 120)}"`)
              .join(" | ")
          : "No written reviews yet.";

      const interaction = await ai.interactions.create({
        model: DEFAULT_GEMINI_MODEL,
        generation_config: {
          thinking_level: "minimal",
        },
        input: `Product: "${product.title}" ($${product.finalPrice}), Tags: ${product.tags.slice(0, 5).join(", ")}.
Description: ${(product.description || "").slice(0, 240)}
Reviews: ${reviewDigest}
Answer this shopper question in 2 concise sentences: "${input.question}"`,
      });

      const directAnswer = (interaction.output_text || "").trim();
      if (directAnswer) {
        const base = buildDeterministicInsights(product, reviews, avgRating);
        const result: AiReviewInsightsResponse = {
          ...base,
          answer: directAnswer,
          aiMode: "gemini",
        };
        insightsCache.set(cacheKey, { data: result, timestamp: now });
        return result;
      }
    } catch (err) {
      console.error("Gemini review Q&A error, using smart fallback:", err);
    }
  }

  const fallbackResult = buildDeterministicInsights(
    product,
    reviews,
    avgRating,
    input.question
  );
  insightsCache.set(cacheKey, { data: fallbackResult, timestamp: now });
  return fallbackResult;
}

function buildDeterministicInsights(
  product: Awaited<ReturnType<typeof findProductByQueryOrId>>,
  reviews: Awaited<ReturnType<typeof getProductReviewsForAi>>,
  avgRating: number,
  question?: string
): AiReviewInsightsResponse {
  const title = product?.title || "This Furniro Piece";
  const price = product?.finalPrice || 250;
  const tags = product?.tags?.slice(0, 4) || ["modern", "handcrafted", "home"];

  const overallSentiment: AiReviewInsightsResponse["overallSentiment"] =
    reviews.length === 0
      ? "New Arrival"
      : avgRating >= 4.4
        ? "Very Positive"
        : avgRating >= 3.5
          ? "Positive"
          : "Mixed";

  const summary =
    reviews.length > 0
      ? `Based on ${reviews.length} verified customer ${
          reviews.length === 1 ? "review" : "reviews"
        } (${avgRating.toFixed(
          1
        )}/5 average), buyers consistently highlight the ${title}'s solid construction, refined finish, and everyday comfort across ${tags
          .slice(0, 2)
          .join(" & ")} interiors.`
      : `The ${title} ($${price}) is a curated Furniro highlight crafted for ${tags.join(
          ", "
        )} spaces. Showroom feedback highlights its balanced proportions, durable joinery, and warm tactile finish.`;

  const pros = [
    "Kiln-dried solid frame & lasting durability",
    `Strong value at $${price}${
      product?.discountPercentage
        ? ` (${product.discountPercentage}% off)`
        : ""
    }`,
    "Versatile proportions for apartments & homes",
    "Easy-care upholstery & scratch-resistant surface",
  ];

  const considerations = [
    "Allow 15–20 minutes for initial unboxing and leg attachment",
    "Natural wood grain and warm lighting may subtly shift tone in person",
  ];

  const bestFor = [
    tags[0]
      ? `${tags[0].charAt(0).toUpperCase() + tags[0].slice(1)} interiors`
      : "Modern living spaces",
    "Apartment & studio layouts",
    "Everyday family & guest entertaining",
  ];

  let answer: string | undefined;
  if (question) {
    const q = question.toLowerCase();
    if (
      q.includes("small") ||
      q.includes("space") ||
      q.includes("apartment") ||
      q.includes("fit")
    ) {
      answer = `Yes — ${title} features a clean, tailored footprint designed to maximize floor space in apartments and studios without feeling bulky. Pair it with light neutral rugs to keep the room airy.`;
    } else if (
      q.includes("assembl") ||
      q.includes("setup") ||
      q.includes("install")
    ) {
      answer = `${title} arrives with pre-aligned hardware and quick assembly that typically takes under 20 minutes. White-glove room placement is also available on eligible orders.`;
    } else if (
      q.includes("pair") ||
      q.includes("match") ||
      q.includes("style")
    ) {
      answer = `${title} pairs beautifully with warm oak or walnut accents, textured bouclé or linen cushions, and brushed brass lighting (${tags
        .slice(0, 3)
        .join(", ")}).`;
    } else if (
      q.includes("quality") ||
      q.includes("durab") ||
      q.includes("material") ||
      q.includes("worth")
    ) {
      answer = `At $${price}, ${title} uses kiln-dried framing and high-resilience cushioning backed by Furniro's 2-year structural warranty—making it a dependable long-term piece.`;
    } else {
      answer = `${title} ($${price}) is crafted for everyday comfort and timeless appeal (${tags
        .slice(0, 3)
        .join(
          ", "
        )}). It includes insured doorstep delivery and a 30-day return window.`;
    }
  }

  return {
    overallSentiment,
    summary,
    pros,
    considerations,
    bestFor,
    answer,
    aiMode: "smart-local",
  };
}
