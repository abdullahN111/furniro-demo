"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import ServiceBar from "@/app/components/shared/ServiceBar";
import PaymentDetails from "@/app/components/PaymentDetails";
import PaymentMethod from "@/app/components/PaymentMethod";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const Page = () => {
  const [selectedOption, setSelectedOption] = useState("Cash On Delivery");
  const [clientSecret, setClientSecret] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { cartItems, selectedItems, removeSelectedItems } = useCart();
  const router = useRouter();

  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(item.id),
  );

  const cartTotal = selectedCartItems.reduce((total, item) => {
    const price =
      typeof item.price === "string"
        ? parseFloat(item.price.replace(/[^0-9.]+/g, ""))
        : item.price;

    return total + (isNaN(price) ? 0 : price * item.quantity);
  }, 0);

  useEffect(() => {
    if (selectedOption === "Stripe" && cartTotal > 0) {
      fetch("/api/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cartTotal }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    } else {
      setClientSecret("");
    }
  }, [selectedOption, cartTotal]);

  const handleOrderCreated = (orderId: string) => {
    localStorage.setItem("lastOrderId", orderId);
    removeSelectedItems(selectedItems);
    router.push(`/track-order?orderId=${orderId}`);
  };

  return (
    <section className="max-w-[1440px] mx-auto">
      <SecondaryHeader routeName="Checkout" />
      <div className="py-10 px-2 lg:px-24 flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-6">
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
          <PaymentMethod
            selectedOption={selectedOption}
            onOrderCreated={handleOrderCreated}
            setIsProcessing={setIsProcessing}
            cartItems={selectedCartItems}
            cartTotal={cartTotal}
          />
          <PaymentDetails
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            amount={cartTotal}
            clientSecret={clientSecret}
            isProcessing={isProcessing}
            items={selectedCartItems}
          />
        </Elements>
      </div>
      <ServiceBar />
    </section>
  );
};

export default Page;
