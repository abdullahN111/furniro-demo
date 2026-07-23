"use client";

import { useStripe, useElements } from "@stripe/react-stripe-js";

export const useStripeCheckout = () => {
  const stripe = useStripe();
  const elements = useElements();

  const confirmPayment = async () => {
    if (!stripe || !elements) return false;

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      console.error(result.error.message);
      return false;
    }

    return result.paymentIntent?.status === "succeeded";
  };

  return { confirmPayment };
};
