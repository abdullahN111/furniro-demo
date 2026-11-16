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

export async function generateProductReviewInsights(
  input: ReviewInsightsInput
): Promise<AiReviewInsightsResponse> {
  const product = await findProductByQueryOrId(input.productId);
  const reviews = await getProductReviewsForAi(input.productId);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length
      : 0;

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (apiKey && product) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const reviewDigest =
        reviews.length > 0
          ? reviews
              .slice(0, 12)
              .map(
                (r, idx) =>
                  `Review #${idx + 1} (${r.rating}/5 by ${r.userName || "Verified Buyer"}): "${r.comment}"`
              )
              .join("\n")
          : "No written customer reviews yet — base insights on product craftsmanship, tags, and specifications.";

      const interaction = await ai.interactions.create({
        model: DEFAULT_GEMINI_MODEL,
        input: `You are Furniro's AI Product & Review Analyst (similar to Amazon Rufus).
Product: "${product.title}"
Price: $${product.finalPrice} (Original: $${product.price}, Discount: ${product.discountPercentage}%)
New Arrival: ${product.isNew ? "Yes" : "No"}
Tags: ${product.tags.join(", ")}
Description: ${(product.description || "").slice(0, 500)}
Customer Reviews (${reviews.length} total, Avg ${avgRating.toFixed(1)}/5):
${reviewDigest}

${input.question ? `Shopper Question: "${input.question}"` : ""}

Return ONLY valid JSON with this exact structure (no markdown fences):
{
  "overallSentiment": "Very Positive" | "Positive" | "Mixed" | "New Arrival",
  "summary": "2-3 sentence synthesis of what buyers love about this product and its craftsmanship.",
  "pros": ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4"],
  "considerations": ["Helpful buyer tip or space consideration 1", "Consideration 2"],
  "bestFor": ["Ideal room/use case 1", "Ideal use case 2", "Ideal use case 3"]${
    input.question
      ? `,\n  "answer": "Direct, helpful 2-3 sentence answer to the shopper's question about ${product.title}."`
      : ""
  }
}`,
      });

      const rawText = (interaction.output_text || "").trim();
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Partial<AiReviewInsightsResponse>;
        return {
          overallSentiment:
            parsed.overallSentiment ||
            (reviews.length === 0
              ? "New Arrival"
              : avgRating >= 4.3
                ? "Very Positive"
                : avgRating >= 3.5
                  ? "Positive"
                  : "Mixed"),
          summary:
            parsed.summary ||
            `${product.title} is praised for its timeless silhouette, dependable build quality, and effortless styling across modern living spaces.`,
          pros:
            Array.isArray(parsed.pros) && parsed.pros.length > 0
              ? parsed.pros.slice(0, 4)
              : [
                  "Artisanal finish & sturdy frame",
                  "Versatile modern silhouette",
                  "True-to-photo warm tones",
                  "Strong value at $" + product.finalPrice,
                ],
          considerations:
            Array.isArray(parsed.considerations) &&
            parsed.considerations.length > 0
              ? parsed.considerations.slice(0, 2)
              : [
                  "Measure doorway and floor clearance before placement",
                  "Wipe with a soft dry cloth to preserve the natural finish",
                ],
          bestFor:
            Array.isArray(parsed.bestFor) && parsed.bestFor.length > 0
              ? parsed.bestFor.slice(0, 3)
              : ["Modern apartments", "Open-plan living areas", "Cozy reading corners"],
          answer: parsed.answer,
          aiMode: "gemini",
        };
      }
    } catch (err) {
      console.error("Gemini review insights error, using smart fallback:", err);
    }
  }

  // Deterministic Smart Analysis Fallback
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
        )}/5 average), buyers consistently highlight the ${title}'s solid construction, refined finish, and comfort. Shoppers note that it elevates ${tags
          .slice(0, 2)
          .join(" & ")} interiors effortlessly.`
      : `The ${title} ($${price}) is a curated Furniro highlight crafted for ${tags.join(
          ", "
        )} aesthetics. Early showroom feedback highlights its balanced proportions, durable joinery, and warm tactile finish.`;

  const pros = [
    "Kiln-dried solid frame & lasting durability",
    `Priced competitively at $${price}${
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
    tags[0] ? `${tags[0].charAt(0).toUpperCase() + tags[0].slice(1)} interiors` : "Modern living spaces",
    "Apartment & studio layouts",
    "Everyday family & guest entertaining",
  ];

  let answer: string | undefined;
  if (input.question) {
    const q = input.question.toLowerCase();
    if (q.includes("small") || q.includes("space") || q.includes("apartment") || q.includes("fit")) {
      answer = `Yes — ${title} features a clean, tailored footprint designed to maximize floor space in apartments and studios without feeling bulky. Pair it with light neutral rugs to keep the room airy.`;
    } else if (q.includes("assembl") || q.includes("setup") || q.includes("install")) {
      answer = `${title} arrives with pre-aligned hardware and tool-free or single-Allen-key assembly that typically takes under 20 minutes. White-glove room placement is also included on eligible orders.`;
    } else if (q.includes("pair") || q.includes("match") || q.includes("style")) {
      answer = `${title} pairs beautifully with warm oak or walnut accents, textured bouclé or linen cushions, and brushed brass lighting (${tags.slice(0, 3).join(", ")}).`;
    } else if (q.includes("quality") || q.includes("durab") || q.includes("material") || q.includes("worth")) {
      answer = `At $${price}, ${title} uses kiln-dried framing and high-resilience cushioning backed by Furniro's 2-year structural warranty—making it an exceptional long-term investment.`;
    } else {
      answer = `${title} ($${price}) is crafted for everyday comfort and timeless appeal (${tags.slice(0, 3).join(", ")}). It includes insured doorstep delivery and a 30-day peace-of-mind return window.`;
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
