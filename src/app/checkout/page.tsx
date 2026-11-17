"use client";

import { useState, useEffect, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Link from "next/link";
import { FiShoppingBag, FiArrowLeft } from "react-icons/fi";

import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import ServiceBar from "@/app/components/shared/ServiceBar";
import PaymentDetails from "@/app/components/PaymentDetails";
import PaymentMethod from "@/app/components/PaymentMethod";
import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const Page = () => {
  const [selectedOption, setSelectedOption] = useState("Cash On Delivery");
  const [clientSecret, setClientSecret] = useState("");
  const [stripeError, setStripeError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { cartItems, selectedItems, removeSelectedItems } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const selectedCartItems = useMemo(
    () => cartItems.filter((item) => selectedItems.includes(item.id)),
    [cartItems, selectedItems]
  );

  const cartTotal = useMemo(
    () =>
      selectedCartItems.reduce((total, item) => {
        const price =
          typeof item.price === "string"
            ? parseFloat(item.price.replace(/[^0-9.]+/g, ""))
            : item.price;

        return total + (isNaN(price) ? 0 : price * item.quantity);
      }, 0),
    [selectedCartItems]
  );

  const itemsSignature = useMemo(
    () =>
      selectedCartItems
        .map((i) => `${i.id}:${i.quantity}`)
        .sort()
        .join("|"),
    [selectedCartItems]
  );

  useEffect(() => {
    if (selectedOption === "Stripe" && cartTotal > 0 && selectedCartItems.length > 0) {
      let active = true;
      setStripeError("");
      fetch("/api/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: cartTotal,
          items: selectedCartItems.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
          })),
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Could not initialize Stripe payment");
          }
          return data;
        })
        .then((data) => {
          if (!active) return;
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          }
        })
        .catch((err) => {
          if (!active) return;
          console.error("Failed to initialize Stripe PaymentIntent:", err);
          setStripeError(
            err instanceof Error
              ? err.message
              : "Unable to load Stripe right now. Please try Cash On Delivery or refresh."
          );
        });

      return () => {
        active = false;
      };
    } else {
      setClientSecret("");
      setStripeError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption, cartTotal, itemsSignature]);

  const handleOrderCreated = (orderId: string) => {
    localStorage.setItem("lastOrderId", orderId);
    removeSelectedItems(selectedItems);
    showToast({
      message: `Order #${orderId} placed successfully!`,
      type: "success",
    });
    router.push(`/track-order?orderId=${orderId}`);
  };

  return (
    <section className="max-w-[1440px] mx-auto bg-white">
      <SecondaryHeader routeName="Checkout" />

      {selectedCartItems.length === 0 ? (
        <div className="max-w-md mx-auto my-20 px-4 text-center">
          <div className="bg-[#FCF8F3] border border-[#f0e4d3] rounded-2xl p-10">
            <div className="w-14 h-14 rounded-full bg-[#F9F1E7] text-[#B88E2F] flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag className="text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Items Selected for Checkout
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Please select items in your shopping cart or browse our catalog to
              add furniture pieces.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/cart"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiArrowLeft /> Back to Cart
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#B88E2F] text-white text-sm font-semibold hover:bg-[#9f7924] transition-colors"
              >
                Browse Shop
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <Elements
            key={clientSecret || "no-secret"}
            stripe={stripePromise}
            options={
              clientSecret
                ? { clientSecret }
                : {
                    mode: "payment",
                    amount: Math.max(Math.round(cartTotal * 100), 50),
                    currency: "usd",
                  }
            }
          >
            <div className="lg:col-span-7">
              <PaymentMethod
                selectedOption={selectedOption}
                onOrderCreated={handleOrderCreated}
                setIsProcessing={setIsProcessing}
                cartItems={selectedCartItems}
                cartTotal={cartTotal}
              />
            </div>
            <div className="lg:col-span-5">
              <PaymentDetails
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                amount={cartTotal}
                clientSecret={clientSecret}
                stripeError={stripeError}
                isProcessing={isProcessing}
                items={selectedCartItems}
              />
            </div>
          </Elements>
        </div>
      )}

      <ServiceBar />
    </section>
  );
};

export default Page;
