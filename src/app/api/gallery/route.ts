import { NextResponse } from "next/server";
import { createClient } from "next-sanity";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-01-13",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { userEmail, products } = await req.json();
    const safeEmail = userEmail.replace(/[^a-zA-Z0-9-_]/g, "_");

    const doc = {
      _id: `gallery-${safeEmail}`,
      _type: "gallery",
      userEmail,
      products: products.slice(0, 8).map((id: string) => ({
        _type: "reference",
        _ref: id,
        _key: `${id}-${Date.now()}-${Math.random()}`,
      })),
      createdAt: new Date().toISOString(),
    };

    await client.createOrReplace(doc);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gallery error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save gallery" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ gallery: null });
  }

  const query = `
    *[_type == "gallery" && userEmail == $email][0]{
      products[]->{
        _id,
        title,
        "image": productImage.asset->url,
        price
      }
    }
  `;

  const gallery = await client.fetch(query, { email });

  return NextResponse.json({ gallery });
}
