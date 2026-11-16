import { NextResponse } from "next/server";
import { auth } from "@/auth/authSetup";
import { runFurniroAgent } from "@ai/services/agentEngine";
import { AiChatRequest } from "@ai/types";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = (await req.json()) as AiChatRequest;

    if (!body?.message && !body?.imageBase64) {
      return NextResponse.json(
        { error: "Message or image is required" },
        { status: 400 }
      );
    }

    const result = await runFurniroAgent({
      ...body,
      message: body.message || "Find furniture matching this photo",
      userEmail: session?.user?.email || null,
      userName: session?.user?.name || null,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("AI Chat Route Error:", error);
    return NextResponse.json(
      {
        reply:
          "I encountered a temporary hiccup connecting to the showroom catalog. Please try your request again!",
        aiMode: "smart-local",
      },
      { status: 200 }
    );
  }
}
