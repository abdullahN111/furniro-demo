"use client";

import { Suspense, useState, useMemo } from "react";
import Image from "next/image";
import Logo from "@/app/public/assets/images/main/Logo.png";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import { FiEye, FiEyeOff, FiCheck, FiShield } from "react-icons/fi";

function getPasswordStrength(pw: string) {
  if (!pw) return { score: 0, label: "", color: "bg-gray-200" };
  let score = 0;
  if (pw.length >= 6) score += 1;
  if (pw.length >= 10) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score += 1;

  const map: Record<number, { label: string; color: string }> = {
    1: { label: "Weak", color: "bg-red-400" },
    2: { label: "Fair", color: "bg-amber-400" },
    3: { label: "Good", color: "bg-[#B88E2F]" },
    4: { label: "Strong", color: "bg-emerald-500" },
  };

  return { score, ...(map[score] || { label: "Weak", color: "bg-red-400" }) };
}

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setMessageType("error");
      setMessage("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setMessageType("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setMessageType("error");
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessageType("error");
        setMessage(data.message || "Could not create account.");
        setLoading(false);
        return;
      }

      setMessageType("success");
      setMessage(data.message || "Account created! Signing you in...");

      // Automatically sign the user in with their new credentials
      const signInResult = await signIn("credentials", {
        email: trimmedEmail,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        showToast({
          message: "Account created! Please sign in.",
          type: "success",
        });
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }

      showToast({
        message: data.linked
          ? `Welcome back, ${trimmedName}! Password linked to your account.`
          : `Welcome to Furniro, ${trimmedName}!`,
        type: "success",
      });

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setMessageType("error");
      setMessage("Network error while creating your account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12 lg:py-16">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-[#f0e4d3] shadow-lg bg-white">
        {/* Left Brand Panel */}
        <div className="lg:col-span-5 bg-[#FCF8F3] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#f0e4d3]">
          <div className="flex flex-col items-center text-center my-auto">
            <Image
              src={Logo}
              alt="Furniro Logo"
              width={68}
              height={68}
              className="mb-4"
            />
            <h1 className="text-3xl font-bold text-[#B88E2F] mb-3">Furniro</h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
              Join the Furniro community to curate your personal wishlist, build
              your #FuniroFurniture gallery, and track deliveries effortlessly.
            </p>

            <ul className="text-left space-y-2.5 text-xs sm:text-sm text-gray-700 w-full max-w-[240px]">
              {[
                "Save favorites across devices",
                "Real-time 5-step order tracking",
                "Verified customer review privileges",
                "One-click Google or Email login",
              ].map((perk) => (
                <li key={perk} className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#F9F1E7] text-[#B88E2F] flex items-center justify-center shrink-0">
                    <FiCheck className="text-xs" />
                  </span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
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
              Create Your Account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Register with your email and password or continue with Google.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="register-name"
                className="text-sm font-semibold text-gray-800"
              >
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                placeholder="e.g. Sarah Jenkins"
                className="text-sm sm:text-base text-gray-900 border border-gray-300 focus:border-[#B88E2F] py-3 px-4 rounded-xl w-full focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="register-email"
                className="text-sm font-semibold text-gray-800"
              >
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="you@example.com"
                className="text-sm sm:text-base text-gray-900 border border-gray-300 focus:border-[#B88E2F] py-3 px-4 rounded-xl w-full focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="register-password"
                  className="text-sm font-semibold text-gray-800"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Min. 6 characters"
                    className="text-sm sm:text-base text-gray-900 border border-gray-300 focus:border-[#B88E2F] py-3 pl-4 pr-10 rounded-xl w-full focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="register-confirm-password"
                  className="text-sm font-semibold text-gray-800"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Re-enter password"
                    className={`text-sm sm:text-base text-gray-900 border py-3 pl-4 pr-10 rounded-xl w-full focus:outline-none transition-colors ${
                      confirmPassword && confirmPassword !== password
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-300 focus:border-[#B88E2F]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Bar */}
            {password.length > 0 && (
              <div className="space-y-1 pt-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Password strength</span>
                  <span className="font-semibold text-gray-700">
                    {strength.label}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`rounded-full transition-colors ${
                        level <= strength.score
                          ? strength.color
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

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
              {loading ? "Creating Account & Signing In..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-5">
            Already have an account?{" "}
            <Link
              href={
                callbackUrl !== "/"
                  ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
                  : "/login"
              }
              className="text-[#B88E2F] font-semibold hover:underline"
            >
              Sign in here
            </Link>
          </p>

          <div className="flex items-center gap-3 my-5">
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

const RegisterPage = () => {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1440px] mx-auto py-20 text-center text-gray-500">
          Loading Registration...
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
};

export default RegisterPage;

