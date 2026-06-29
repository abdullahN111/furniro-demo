import { NextResponse } from "next/server";
import { serverClient } from "@/sanity/lib/serverClient";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "All fields are required." },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters." },
                { status: 400 }
            );
        }

        const existingUser = await serverClient.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email }
        );

        if (existingUser) {
            return NextResponse.json(
                { message: "Email already exists." },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await serverClient.create({
            _type: "user",
            name,
            email,
            passwordHash: hashedPassword,
            provider: "credentials",
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            message: "Account created successfully.",
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Something went wrong." },
            { status: 500 }
        );
    }
}