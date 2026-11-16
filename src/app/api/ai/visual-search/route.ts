import { NextResponse } from "next/server";
import { runVisualSearch } from "@ai/services/visualSearchEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, fileName, presetId, customHint } = body || {};

    if (!imageBase64 && !presetId && !customHint) {
      return NextResponse.json(
        { error: "Please upload an image or select a room style preset." },
        { status: 400 }
      );
    }

    const result = await runVisualSearch({
      imageBase64,
      mimeType,
      fileName,
      presetId,
      customHint,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("AI Visual Search Route Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze visual search request." },
      { status: 500 }
    );
  }
}
