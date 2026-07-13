import { NextResponse } from "next/server";
import { auth } from "@/auth/authSetup";
import { serverClient } from "@/sanity/lib/serverClient";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required." },
        { status: 400 },
      );
    }
    const user = await serverClient.fetch(
      `*[_type == "user" && email == $email][0]{
        _id,
        favorites
      }`,
      {
        email: session.user.email,
      },
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }

    const favorites = user.favorites || [];

    const alreadyFavorite = favorites.some(
      (fav: { _ref: string }) => fav._ref === productId,
    );

    if (alreadyFavorite) {
      await serverClient
        .patch(user._id)
        .set({
          favorites: favorites.filter(
            (fav: { _ref: string }) => fav._ref !== productId,
          ),
        })
        .commit();

      return NextResponse.json({
        success: true,
        isFavorite: false,
        message: "Removed from favorites.",
      });
    }

    await serverClient
      .patch(user._id)
      .set({
        favorites: [
          ...favorites,
          {
            _type: "reference",
            _ref: productId,
          },
        ],
      })
      .commit();

    return NextResponse.json({
      success: true,
      isFavorite: true,
      message: "Added to favorites.",
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add favorite" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json([]);
  }

  const favorites = await serverClient.fetch(
    `*[_type=="user" && email==$email][0]{
    favorites[]->{
      _id,
      title,
      price,
      slug,
      featured,
      dicountPercentage,
      isNew,
      inventoryInStock,
      "image": productImage.asset->url
    }
  }.favorites`,
    {
      email: session.user.email,
    },
  );

  const formatted =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    favorites?.map((product: any) => ({
      ...product,
      dicountPercentage: product.dicountPercentage
        ? {
            text: `-${product.dicountPercentage}%`,
            color: "#E97171",
          }
        : undefined,
      oldPrice: product.dicountPercentage
        ? (
            parseFloat(product.price) *
            (1 + parseFloat(product.dicountPercentage) / 100)
          ).toFixed(2)
        : undefined,
    })) || [];

  return NextResponse.json(formatted);
}
