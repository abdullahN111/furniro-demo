import { GoogleGenAI } from "@google/genai";
import {
  DEFAULT_GEMINI_MODEL,
  SAMPLE_VISUAL_SEARCH_PRESETS,
} from "@ai/config/constants";
import {
  fetchAllCatalogProducts,
  searchCatalogProducts,
} from "@ai/services/catalogService";
import { AiProductCard, AiVisualSearchResult } from "@ai/types";

interface AnalyzeVisualSearchInput {
  imageBase64?: string;
  mimeType?: string;
  fileName?: string;
  presetId?: string;
  customHint?: string;
}

interface ParsedVisionAttributes {
  detectedStyle?: string;
  detectedCategory?: string;
  colorPalette?: string[];
  keywords?: string[];
  summary?: string;
}

function scoreProductsAgainstVision(
  allProducts: AiProductCard[],
  attrs: Required<ParsedVisionAttributes>
): AiProductCard[] {
  const kwLower = attrs.keywords.map((k) => k.toLowerCase());
  const catLower = attrs.detectedCategory.toLowerCase();

  const scored = allProducts.map((product) => {
    let score = 0;
    const matchedTerms: string[] = [];
    const titleLower = product.title.toLowerCase();
    const tagsLower = product.tags.map((t) => t.toLowerCase());
    const descLower = (product.description || "").toLowerCase();

    for (const kw of kwLower) {
      const stem = kw.endsWith("s") && kw.length > 3 ? kw.slice(0, -1) : kw;
      if (titleLower.includes(stem)) {
        score += 10;
        matchedTerms.push(kw);
      } else if (tagsLower.some((t) => t.includes(stem))) {
        score += 7;
        matchedTerms.push(kw);
      } else if (descLower.includes(stem)) {
        score += 4;
        matchedTerms.push(kw);
      }
    }

    if (
      catLower &&
      (titleLower.includes(catLower) ||
        tagsLower.some((t) => t.includes(catLower)) ||
        descLower.includes(catLower))
    ) {
      score += 6;
    }

    const uniqueMatches = Array.from(new Set(matchedTerms)).slice(0, 3);
    const matchReason =
      uniqueMatches.length > 0
        ? `Matches ${attrs.detectedStyle.toLowerCase()} aesthetic (${uniqueMatches.join(", ")})`
        : `Complements your ${attrs.detectedCategory.toLowerCase()} room palette`;

    return {
      product: {
        ...product,
        matchReason,
      },
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((item) => item.product);
}

export async function runVisualSearch(
  input: AnalyzeVisualSearchInput
): Promise<AiVisualSearchResult> {
  const allProducts = await fetchAllCatalogProducts();

  // 1. Check if a curated sample room preset was chosen
  if (input.presetId) {
    const preset = SAMPLE_VISUAL_SEARCH_PRESETS.find(
      (p) => p.id === input.presetId
    );
    if (preset) {
      const attrs: Required<ParsedVisionAttributes> = {
        detectedStyle: preset.style,
        detectedCategory: preset.category,
        colorPalette: preset.colors,
        keywords: preset.keywords,
        summary: `Detected a ${preset.style} ${preset.category} setting featuring ${preset.colors.join(", ")} tones.`,
      };
      const products = scoreProductsAgainstVision(allProducts, attrs);
      return {
        ...attrs,
        products,
        aiMode: process.env.GEMINI_API_KEY ? "gemini" : "smart-local",
      };
    }
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const cleanBase64 = input.imageBase64
    ? input.imageBase64.replace(/^data:[^;]+;base64,/, "")
    : "";

  // 2. If Gemini API key & imageBase64 are present, use Gemini Multimodal Interactions API
  if (apiKey && cleanBase64) {
    try {
      const catalogVocabulary = Array.from(
        new Set(
          allProducts.flatMap((p) => [
            p.title,
            ...p.tags.slice(0, 5),
          ])
        )
      )
        .slice(0, 40)
        .join(", ");

      const ai = new GoogleGenAI({ apiKey });
      const interaction = await ai.interactions.create({
        model: DEFAULT_GEMINI_MODEL,
        input: [
          {
            type: "user_input",
            content: [
              {
                type: "image",
                data: cleanBase64,
                mime_type: input.mimeType || "image/jpeg",
              },
              {
                type: "text",
                text: `Analyze this furniture or interior room image for the Furniro store catalog.
Available store titles/tags include: ${catalogVocabulary}.
${input.customHint ? `User hint: ${input.customHint}` : ""}

Return ONLY valid JSON with this exact shape (no markdown fences):
{
  "detectedStyle": "e.g. Scandinavian Minimalist, Mid-Century Modern, Contemporary Cozy",
  "detectedCategory": "living | dining | bedroom | chair | sofa | table | lamp",
  "colorPalette": ["Color 1", "Color 2", "Color 3"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "summary": "1-2 sentence interior stylist description of the furniture/room and why the matched pieces fit."
}`,
              },
            ],
          },
        ],
      });

      const rawText = (interaction.output_text || "").trim();
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as ParsedVisionAttributes;
        const attrs: Required<ParsedVisionAttributes> = {
          detectedStyle: parsed.detectedStyle || "Modern Scandinavian",
          detectedCategory: parsed.detectedCategory || "living",
          colorPalette:
            Array.isArray(parsed.colorPalette) && parsed.colorPalette.length > 0
              ? parsed.colorPalette.slice(0, 4)
              : ["Warm Oak", "Neutral Linen", "Charcoal"],
          keywords:
            Array.isArray(parsed.keywords) && parsed.keywords.length > 0
              ? parsed.keywords
              : ["sofa", "chair", "table", "living", "modern"],
          summary:
            parsed.summary ||
            "Analyzed your uploaded photo and matched pieces with similar silhouette, material, and room aesthetic.",
        };

        const products = scoreProductsAgainstVision(allProducts, attrs);
        return {
          ...attrs,
          products,
          aiMode: "gemini",
        };
      }
    } catch (err) {
      console.error("Gemini visual search error, using smart fallback:", err);
    }
  }

  // 3. Smart fallback (when GEMINI_API_KEY is not set or offline)
  const hintSource = `${input.fileName || ""} ${input.customHint || ""}`.toLowerCase();

  let detectedCategory = "living";
  let detectedStyle = "Modern Scandinavian";
  let colorPalette = ["Warm Oak", "Soft Cream", "Muted Sage"];
  let keywords = ["chair", "sofa", "table", "living", "minimalist", "wood"];

  if (
    hintSource.includes("bed") ||
    hintSource.includes("sleep") ||
    hintSource.includes("lamp") ||
    hintSource.includes("night")
  ) {
    detectedCategory = "bedroom";
    detectedStyle = "Contemporary Sanctuary";
    colorPalette = ["Ivory", "Warm Walnut", "Soft Gold"];
    keywords = ["bed", "bedroom", "couch", "lamp", "night", "cozy"];
  } else if (
    hintSource.includes("din") ||
    hintSource.includes("table") ||
    hintSource.includes("cafe") ||
    hintSource.includes("kitchen")
  ) {
    detectedCategory = "dining";
    detectedStyle = "Mid-Century Artisanal";
    colorPalette = ["Natural Teak", "Espresso", "Warm Linen"];
    keywords = ["dining", "table", "chair", "cafe", "wood", "stool"];
  } else if (hintSource.includes("chair") || hintSource.includes("seat")) {
    detectedCategory = "chair";
    detectedStyle = "Nordic Accent Seating";
    colorPalette = ["Birch Wood", "Pebble Gray", "Warm Brass"];
    keywords = ["chair", "cafe", "stylish", "seat", "lounge"];
  } else if (input.customHint) {
    const customTokens = input.customHint
      .toLowerCase()
      .split(/[\s,.-]+/)
      .filter((t) => t.length > 2);
    if (customTokens.length > 0) {
      keywords = [...customTokens, ...keywords];
    }
  }

  const attrs: Required<ParsedVisionAttributes> = {
    detectedStyle,
    detectedCategory,
    colorPalette,
    keywords,
    summary: `Identified a ${detectedStyle} aesthetic suited for ${detectedCategory} spaces, featuring ${colorPalette.join(", ")} tones.`,
  };

  let products = scoreProductsAgainstVision(allProducts, attrs);
  if (products.length === 0) {
    products = await searchCatalogProducts({
      query: keywords.join(" "),
      category: detectedCategory,
      limit: 4,
    });
  }

  return {
    ...attrs,
    products,
    aiMode: "smart-local",
  };
}
