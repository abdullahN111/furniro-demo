import { NextResponse } from "next/server";
import { auth } from "@/auth/authSetup";
import { serverClient } from "@/sanity/lib/serverClient";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ count: 0 });
  }

  const user = await serverClient.fetch(
    `*[_type=="user" && lower(email)==$email][0]{
      favorites
    }`,
    {
      email: session.user.email.trim().toLowerCase(),
    },
  );

  return NextResponse.json({
    count: user?.favorites?.length || 0,
  });
}
