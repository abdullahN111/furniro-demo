import { NextResponse } from "next/server";
import { serverClient } from "@/sanity/lib/serverClient";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawName = typeof body.name === "string" ? body.name.trim() : "";
    const rawEmail =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const rawPassword = typeof body.password === "string" ? body.password : "";

    if (!rawName || !rawEmail || !rawPassword) {
      return NextResponse.json(
        { message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      return NextResponse.json(
        { message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (rawPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const existingUser = await serverClient.fetch(
      `*[_type == "user" && lower(email) == $email][0]`,
      { email: rawEmail }
    );

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // If user previously signed in with Google and has no passwordHash yet,
    // link their account by setting passwordHash on the existing user document.
    if (existingUser) {
      if (!existingUser.passwordHash) {
        await serverClient
          .patch(existingUser._id)
          .set({
            name: rawName || existingUser.name,
            passwordHash: hashedPassword,
          })
          .commit();

        return NextResponse.json({
          success: true,
          linked: true,
          message:
            "Password added to your existing Google account! Signing you in...",
        });
      }

      return NextResponse.json(
        {
          message:
            "An account with this email already exists. Please sign in instead.",
        },
        { status: 409 }
      );
    }

    await serverClient.create({
      _type: "user",
      name: rawName,
      email: rawEmail,
      passwordHash: hashedPassword,
      provider: "credentials",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      linked: false,
      message: "Account created successfully! Signing you in...",
    });
  } catch (error) {
    console.error("Create account error:", error);

    return NextResponse.json(
      { message: "Something went wrong while creating your account." },
      { status: 500 }
    );
  }
}
