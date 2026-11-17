"use client";

import Image from "next/image";
import Link from "next/link";
import { PaymentElement } from "@stripe/react-stripe-js";
import { CartItem } from "../context/CartContext";
import { FiLock, FiCreditCard, FiTruck, FiAlertCircle } from "react-icons/fi";

interface PaymentDetailsProps {
  selectedOption: string;
  setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
  amount: number;
  clientSecret?: string;
  stripeError?: string;
  isProcessing: boolean;
  items: CartItem[];
}

const PaymentDetails = ({
  selectedOption,
  setSelectedOption,
  clientSecret,
  stripeError,
  isProcessing,
  items,
}: PaymentDetailsProps) => {
  const cartTotal = items.reduce((total, item) => {
    const price =
      typeof item.price === "string"
        ? parseFloat(item.price.replace(/[^0-9.]+/g, ""))
        : item.price;
    return total + (isNaN(price) ? 0 : price * item.quantity);
  }, 0);

  const isStripeWaiting = selectedOption === "Stripe" && !clientSecret;

  return (
    <div className="bg-[#FCF8F3] border border-[#f0e4d3] rounded-2xl p-6 sm:p-8 shadow-xs sticky top-28">
      <h3 className="text-xl font-bold text-gray-900 mb-5">Your Order</h3>

      {/* Itemized List */}
      <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1 mb-5">
        {items.map((item) => {
          const unitPrice =
            typeof item.price === "string"
              ? parseFloat(item.price.replace(/[^0-9.]+/g, "")) || 0
              : Number(item.price);

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#f0e4d3]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F9F1E7] shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Qty: {item.quantity} &times; ${unitPrice.toFixed(2)}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900 shrink-0">
                ${(unitPrice * item.quantity).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="space-y-2.5 border-y border-[#e5d6c0] py-4 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-900">
            ${cartTotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="font-semibold text-emerald-700">Free</span>
        </div>
        <div className="flex justify-between items-baseline pt-2 border-t border-[#e5d6c0]">
          <span className="text-base font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-[#B88E2F]">
            ${cartTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700">
          Payment Method
        </h4>

        <label
          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
            selectedOption === "Cash On Delivery"
              ? "border-[#B88E2F] bg-white shadow-2xs"
              : "border-gray-200 bg-white/60 hover:bg-white"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="Cash On Delivery"
            checked={selectedOption === "Cash On Delivery"}
            onChange={() => setSelectedOption("Cash On Delivery")}
            className="mt-1 accent-[#B88E2F]"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 font-semibold text-sm text-gray-900">
              <FiTruck className="text-[#B88E2F]" />
              <span>Cash On Delivery</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pay in cash upon white-glove delivery at your doorstep.
            </p>
          </div>
        </label>

        <label
          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
            selectedOption === "Stripe"
              ? "border-[#B88E2F] bg-white shadow-2xs"
              : "border-gray-200 bg-white/60 hover:bg-white"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="Stripe"
            checked={selectedOption === "Stripe"}
            onChange={() => setSelectedOption("Stripe")}
            className="mt-1 accent-[#B88E2F]"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 font-semibold text-sm text-gray-900">
              <FiCreditCard className="text-[#B88E2F]" />
              <span>Credit / Debit Card (Stripe)</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Instant encrypted payment via Stripe.
            </p>
          </div>
        </label>

        {selectedOption === "Stripe" && (
          <div className="mt-3 p-4 bg-white rounded-xl border border-gray-200">
            {stripeError ? (
              <div className="flex items-start gap-2 text-xs text-red-600 py-2">
                <FiAlertCircle className="text-base shrink-0 mt-0.5" />
                <span>{stripeError}</span>
              </div>
            ) : clientSecret ? (
              <PaymentElement />
            ) : (
              <p className="text-xs text-gray-500 text-center py-4 animate-pulse">
                Loading secure Stripe payment form...
              </p>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 leading-relaxed mt-5">
        Your personal data will be used to process your order and support your
        experience throughout this website in accordance with our{" "}
        <Link
          href="/privacy-policy"
          className="font-semibold text-[#B88E2F] hover:underline"
        >
          Privacy Policy
        </Link>
        .
      </p>

      <button
        type="submit"
        form="checkout-form"
        disabled={isProcessing || isStripeWaiting}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#B88E2F] hover:bg-[#9f7924] text-white font-semibold py-4 px-6 text-base shadow-sm transition-colors disabled:opacity-60"
      >
        <FiLock className="text-sm" />
        <span>
          {isProcessing
            ? "Processing Order..."
            : isStripeWaiting
              ? "Initializing Stripe..."
              : `Place Order — $${cartTotal.toFixed(2)}`}
        </span>
      </button>
    </div>
  );
};

export default PaymentDetails;
