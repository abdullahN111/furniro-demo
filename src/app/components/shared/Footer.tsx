"use client";

import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/app/context/ToastContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmed || !emailRegex.test(trimmed)) {
      showToast({
        message: "Please enter a valid email address",
        type: "error",
      });
      return;
    }

    setEmail("");
    showToast({
      message: "Thank you for subscribing to the Furniro newsletter!",
      type: "success",
    });
  };

  return (
    <footer className="bg-white border-t border-gray-200 mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-[80px] pt-12 pb-6">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.2fr] gap-10 lg:gap-12">
        {/* Brand Info */}
        <div className="flex flex-col gap-5">
          <Link href="/" className="font-bold text-2xl text-gray-900 w-fit">
            Furniro.
          </Link>
          <p className="max-w-[290px] text-sm sm:text-base text-[#9F9F9F] leading-relaxed">
            400 University Drive Suite 200 Coral Gables,
            <br />
            FL 33134 USA
          </p>
        </div>

        {/* Navigation & Help Links */}
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-5 items-start">
            <h6 className="text-[#9F9F9F] text-sm font-semibold uppercase tracking-wider">
              Links
            </h6>
            <ul className="flex flex-col gap-4">
              <li>
                <Link
                  href="/"
                  className="text-sm sm:text-base font-medium text-gray-800 hover:text-[#B88E2F] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-sm sm:text-base font-medium text-gray-800 hover:text-[#B88E2F] transition-colors"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm sm:text-base font-medium text-gray-800 hover:text-[#B88E2F] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm sm:text-base font-medium text-gray-800 hover:text-[#B88E2F] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-5 items-start">
            <h6 className="text-[#9F9F9F] text-sm font-semibold uppercase tracking-wider">
              Help
            </h6>
            <ul className="flex flex-col gap-4">
              <li>
                <Link
                  href="/payment-options"
                  className="text-sm sm:text-base font-medium text-gray-800 hover:text-[#B88E2F] transition-colors"
                >
                  Payment Options
                </Link>
              </li>
              <li>
                <Link
                  href="/return-policy"
                  className="text-sm sm:text-base font-medium text-gray-800 hover:text-[#B88E2F] transition-colors"
                >
                  Return Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm sm:text-base font-medium text-gray-800 hover:text-[#B88E2F] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Form */}
        <div className="flex flex-col gap-5">
          <h6 className="text-[#9F9F9F] text-sm font-semibold uppercase tracking-wider">
            Newsletter
          </h6>
          <p className="text-sm text-gray-500">
            Receive exclusive offers, interior styling tips, and early access to
            new arrivals.
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-wrap items-center gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email Address"
              aria-label="Email address for newsletter"
              className="outline-none border-b-2 border-gray-800 focus:border-[#B88E2F] text-sm py-1.5 min-w-0 flex-1 bg-transparent transition-colors"
            />
            <button
              type="submit"
              className="text-sm font-bold border-b-2 border-gray-800 hover:border-[#B88E2F] hover:text-[#B88E2F] py-1.5 uppercase tracking-wider cursor-pointer transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-600">
        <p>&copy; {currentYear} Furniro. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
