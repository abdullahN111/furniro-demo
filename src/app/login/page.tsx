"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Logo from "@/app/public/assets/images/main/Logo.png";
import { signIn } from "next-auth/react";
import Link from "next/link";

interface User {
  name?: string;
  email?: string;
  image?: string;
}

const LoginPage = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/account-info");
      const data = await res.json();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row py-16">
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-5 sm:px-8 lg:px-16 text-center bg-white lg:shadow-none border-b lg:border-none border-gray-200 py-8 lg:py-0">
        <Image
          src={Logo}
          alt="Furniro Logo"
          width={90}
          height={90}
          className="mb-4"
        />
        <h2 className="text-3xl md:text-4xl lg:text-[44px] font-extrabold text-[#B88E2F] mb-4">
          Furniro
        </h2>
        <p className="text-base lg:text-lg max-w-md leading-relaxed text-gray-700">
          Elevate your living space with timeless, high-quality furniture.
          Explore our collection today and experience the perfect blend of style
          and comfort.
        </p>
      </div>

      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-5 sm:px-8 lg:px-16 bg-white lg:rounded-lg py-8 lg:py-0 min-h-[80vh]">
        <div className="text-center w-full max-w-sm">
          <h2 className="text-[26px] lg:text-3xl font-bold text-[#B88E2F] my-4">
            {user ? "Welcome back!" : "Unlock Your Home’s Elegance"}
          </h2>
          <p className="text-[#666] text-sm lg:text-base mb-6">
            {user
              ? `You're signed in as ${user.email}. Start exploring our premium furniture.`
              : "Sign in now and start creating your dream space with our premium furniture."}
          </p>
        </div>

        {user ? (
          <div className="text-center flex flex-col items-center gap-6">
            <h3 className="text-xl font-semibold text-[#B88E2F]">
              Hello, {user.name?.split(" ")[0] || "Valued Customer"}!
            </h3>
            <Link href="/">
              <button className="text-white bg-[#B88E2F] hover:bg-[#b88f2ff8] rounded-md py-3 px-6 font-semibold shadow-md transition duration-300 w-full max-w-sm">
                Go to Homepage
              </button>
            </Link>
          </div>
        ) : (
          <div className="w-full max-w-sm flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-lg font-semibold">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="text-base text-[#333] border border-[#B88E2F] py-3 px-4 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#B88E2F]"
              />
            </div>

            <button
              onClick={() => signIn("google")}
              className="text-white text-lg bg-[#B88E2F] hover:bg-[#b88f2ff8] rounded-md py-3 px-6 font-semibold shadow-md transition duration-300 w-full max-w-sm"
            >
              Sign In
            </button>

            <div className="w-full max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-700" />
                <div className="text-gray-700 text-2xl font-semibold whitespace-nowrap">
                  OR
                </div>
                <div className="flex-1 h-px bg-gray-700" />
              </div>
            </div>

            <button
              onClick={() => signIn("google")}
              className="flex items-center justify-center gap-3 text-gray-700 bg-white border border-gray-700 hover:bg-[#ffffffa8] rounded-md py-3 px-6 font-semibold shadow-sm transition duration-300 w-full"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 488 512"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M488 261.8c0-17.8-1.6-35.2-4.6-52H249v98.5h134.5c-5.8 31.1-23.7 57.4-50.6 75.1v62.4h81.7c47.8-44.1 73.4-109.1 73.4-183.9z"
                  fill="#4285F4"
                />
                <path
                  d="M249 492c67.2 0 123.7-22.4 164.9-60.8l-81.7-62.4c-22.7 15.2-51.5 24.2-83.2 24.2-63.9 0-118-43.1-137.4-101.2H27.1v63.7C68.8 426.4 153.3 492 249 492z"
                  fill="#34A853"
                />
                <path
                  d="M111.6 291.8c-5.4-15.9-8.5-32.8-8.5-50.2s3.1-34.3 8.5-50.2v-63.7H27.1C9.7 155.9 0 200.2 0 241.6s9.7 85.7 27.1 121.3l84.5-63.7z"
                  fill="#FBBC05"
                />
                <path
                  d="M249 97.3c36.6 0 69.3 12.6 95.1 37.2l71.2-71.2C372.7 26.3 318.7 0 249 0 153.3 0 68.8 65.6 27.1 150.9l84.5 63.7C131 140.4 185.1 97.3 249 97.3z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
