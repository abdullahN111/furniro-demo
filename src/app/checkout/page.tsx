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
import { v4 as uuidv4 } from "uuid";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const Page = () => {
  const [selectedOption, setSelectedOption] = useState("Cash On Delivery");
  const [clientSecret, setClientSecret] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { cartItems, clearCart } = useCart();
  const router = useRouter();

  const cartTotal = cartItems.reduce((total, item) => {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStripePayment = async (formData: any) => {
    setIsProcessing(true);

    const orderId = uuidv4().slice(0, 8);
    const orderDetails = {
      orderId,
      user: { ...formData },
      items: cartItems.map((item) => ({
        productId: item.id,
        price: Number(item.price),
        quantity: item.quantity,
      })),
      total: cartItems.reduce(
        (acc, item) => acc + parseFloat(String(item.price)) * item.quantity,
        0
      ),
      paymentMethod: selectedOption,
    };

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderDetails),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("lastOrderId", orderId);

        clearCart();
        router.push("/track-order");
      } else {
        console.error("Order submission failed:", result.message);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Order submission failed", error);
      setIsProcessing(false);
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto">
      <SecondaryHeader routeName="Checkout" />
      <div className="py-10 px-2 lg:px-24 flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-6">
        <PaymentMethod
          selectedOption={selectedOption}
          onStripePayment={handleStripePayment}
        />

        {selectedOption === "Stripe" && clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentDetails
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              amount={cartTotal}
              clientSecret={clientSecret}
              isProcessing={isProcessing}
            />
          </Elements>
        ) : (
          <PaymentDetails
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            amount={cartTotal}
            isProcessing={isProcessing}
          />
        )}
      </div>
      <ServiceBar />
    </section>
  );
};

export default Page;
