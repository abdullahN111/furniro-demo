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

    const { products } = await req.json();
    if (!Array.isArray(products) || products.length < 4) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select at least 4 products for your gallery.",
        },
        { status: 400 }
      );
    }

    const userEmail = session.user.email.trim().toLowerCase();
    const safeEmail = userEmail.replace(/[^a-zA-Z0-9-_]/g, "_");

    const doc = {
      _id: `gallery-${safeEmail}`,
      _type: "gallery",
      userEmail,
      products: products.slice(0, 8).map((id: string) => ({
        _type: "reference",
        _ref: String(id),
        _key: `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      })),
      createdAt: new Date().toISOString(),
    };

    await serverClient.createOrReplace(doc);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gallery error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save gallery" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ gallery: null });
  }

  const query = `
    *[_type == "gallery" && lower(userEmail) == $email][0]{
      products[]->{
        _id,
        title,
        "image": productImage.asset->url,
        price
      }
    }
  `;

  const gallery = await serverClient.fetch(query, { email });

  return NextResponse.json({ gallery });
}
