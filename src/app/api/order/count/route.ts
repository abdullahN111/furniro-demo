import { NextResponse } from "next/server";
import { auth } from "@/auth/authSetup";
import { serverClient } from "@/sanity/lib/serverClient";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ count: 0 });
    }

    const count = await serverClient.fetch(
      `count(
        *[
          _type == "order" &&
          user.email == $email &&
          status != "Delivered"
        ]
      )`,
      {
        email: session.user.email,
      },
    );

    return NextResponse.json({ count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
