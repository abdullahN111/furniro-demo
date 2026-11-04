"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Logo from "@/app/public/assets/images/main/Logo.png";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import { FiEye, FiEyeOff, FiShield } from "react-icons/fi";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setMessageType("error");
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const result = await signIn("credentials", {
      email: trimmedEmail,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setMessageType("error");
      setMessage(
        "Invalid email or password. If you signed up with Google, click 'Continue with Google' or register a password.",
      );
      return;
    }

    setMessageType("success");
    setMessage("Signed in! Redirecting...");
    showToast({
      message: "Welcome back to Furniro!",
      type: "success",
    });

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12 lg:py-16">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-[#f0e4d3] shadow-lg bg-white">
        {/* Left Brand Panel */}
        <div className="lg:col-span-5 bg-[#FCF8F3] p-8 sm:p-10 flex flex-col justify-between items-center text-center border-b lg:border-b-0 lg:border-r border-[#f0e4d3]">
          <div className="my-auto flex flex-col items-center">
            <Image
              src={Logo}
              alt="Furniro Logo"
              width={72}
              height={72}
              className="mb-4"
            />
            <h1 className="text-3xl font-bold text-[#B88E2F] mb-3">Furniro</h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Elevate your living space with timeless, handcrafted furniture.
              Sign in to manage your wishlist, track deliveries, and enjoy
              seamless checkout.
            </p>
          </div>

          <div className="pt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <FiShield className="text-[#B88E2F]" />
            <span>Encrypted & secured with NextAuth</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Sign in with your email and password or Google account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-email"
                className="text-sm font-semibold text-gray-800"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || messageType === "success"}
                placeholder="you@example.com"
                className="text-sm sm:text-base text-gray-900 border border-gray-300 focus:border-[#B88E2F] py-3 px-4 rounded-xl w-full focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-password"
                className="text-sm font-semibold text-gray-800"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || messageType === "success"}
                  placeholder="Enter your password"
                  className="text-sm sm:text-base text-gray-900 border border-gray-300 focus:border-[#B88E2F] py-3 pl-4 pr-11 rounded-xl w-full focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {message && (
              <div
                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  messageType === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white text-sm sm:text-base bg-[#B88E2F] hover:bg-[#9f7924] rounded-xl py-3.5 px-6 font-semibold shadow-sm transition-colors disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-5">
            Don&apos;t have an account?{" "}
            <Link
              href={
                callbackUrl !== "/"
                  ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
                  : "/register"
              }
              className="text-[#B88E2F] font-semibold hover:underline"
            >
              Register now
            </Link>
          </p>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              OR
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="flex items-center justify-center gap-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl py-3 px-6 text-sm sm:text-base font-semibold transition-colors w-full"
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
      </div>
    </section>
  );
}

const LoginPage = () => {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1440px] mx-auto py-20 text-center text-gray-500">
          Loading Sign In...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
};

export default LoginPage;
