"use client";

import { useForm, UseFormRegister, FieldErrors } from "react-hook-form";
import { FaAngleDown } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";

interface FormData {
  firstname: string;
  lastname: string;
  country: string;
  streetaddress: string;
  city: string;
  province: string;
  zipcode: string;
  phone: string;
  email: string;
}

interface InputFieldProps {
  label: string;
  id: keyof FormData;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  required?: boolean;
  pattern?: RegExp;
}

interface SelectFieldProps extends Omit<InputFieldProps, "pattern"> {
  children: React.ReactNode;
}

interface CartItem {
  id: string;
  price: number | string;
  quantity: number;
}

interface PaymentMethodProps {
  selectedOption: string;
  onOrderCreated: (orderId: string) => void;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  cartItems: CartItem[];
  cartTotal: number;
}

const PaymentMethod = ({
  selectedOption,
  onOrderCreated,
  setIsProcessing,
  cartItems, // ✅ used directly now, no rename
  cartTotal,
}: PaymentMethodProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.email) {
      setValue("email", session.user.email);
    }
  }, [session, setValue]);

  const submitHandler = async (data: FormData) => {
    setIsProcessing(true);
    const orderId = uuidv4().slice(0, 8);

    const baseOrderDetails = {
      orderId,
      user: { ...data },
      items: cartItems.map((item) => ({
        productId: item.id,
        price: Number(item.price),
        quantity: item.quantity,
      })),
      total: cartTotal,
    };

    try {
      if (selectedOption === "Stripe") {
        if (!stripe || !elements) {
          console.error("Stripe.js hasn't loaded yet.");
          setIsProcessing(false);
          return;
        }

        const { error: submitError } = await elements.submit();
        if (submitError) {
          console.error(submitError.message);
          setIsProcessing(false);
          return;
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });

        if (error) {
          console.error("Payment failed:", error.message);
          setIsProcessing(false);
          return;
        }

        if (paymentIntent?.status !== "succeeded") {
          console.error("Unexpected payment status:", paymentIntent?.status);
          setIsProcessing(false);
          return;
        }

        const response = await fetch("/api/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...baseOrderDetails,
            paymentMethod: "Stripe",
            paid: true,
            stripePaymentIntentId: paymentIntent.id,
          }),
        });

        const result = await response.json();
        if (response.ok) {
          onOrderCreated(orderId);
        } else {
          console.error("Order submission failed:", result.message);
          setIsProcessing(false);
        }
      } else {
        const response = await fetch("/api/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...baseOrderDetails,
            paymentMethod: "Cash On Delivery",
            paid: false,
          }),
        });

        const result = await response.json();
        if (response.ok) {
          onOrderCreated(orderId);
        } else {
          console.error("Order submission failed:", result.message);
          setIsProcessing(false);
        }
      }
    } catch (err) {
      console.error("Order submission failed", err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full sm:w-[600px] py-16 px-4 sm:px-8 lg:px-16">
      <h2 className="text-[32px] sm:text-[34px] font-semibold mb-8">
        Billing Details
      </h2>
      <form
        onSubmit={handleSubmit(submitHandler)}
        id="checkout-form"
        className="flex flex-col gap-8"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <InputField
            label="First Name"
            id="firstname"
            register={register}
            errors={errors}
            required
          />
          <InputField
            label="Last Name"
            id="lastname"
            register={register}
            errors={errors}
            required
          />
        </div>

        <InputField
          label="Phone"
          id="phone"
          register={register}
          errors={errors}
          required
          pattern={/^[0-9]+$/}
        />

        <div className="flex flex-col gap-[17px] w-full">
          <label className="text-base font-semibold">Email</label>
          <input
            type="email"
            value={session?.user?.email || ""}
            readOnly
            className="border border-[#9F9F9F] rounded-lg h-[70px] w-full text-base px-[14px] bg-gray-100 cursor-not-allowed"
          />
          <input
            type="hidden"
            {...register("email")}
            value={session?.user?.email || ""}
          />
        </div>

        <SelectField
          label="Country / Region"
          id="country"
          register={register}
          errors={errors}
          required
        >
          <option value="Pakistan">Pakistan</option>
          <option value="India">India</option>
          <option value="Bangladesh">Bangladesh</option>
          <option value="Sri Lanka">Sri Lanka</option>
        </SelectField>

        <SelectField
          label="Province"
          id="province"
          register={register}
          errors={errors}
          required
        >
          <option value="Sindh">Sindh</option>
          <option value="Punjab">Punjab</option>
          <option value="KPK">KPK</option>
          <option value="Balochistan">Balochistan</option>
        </SelectField>

        <InputField
          label="Town / City"
          id="city"
          register={register}
          errors={errors}
          required
        />
        <InputField
          label="Street Address"
          id="streetaddress"
          register={register}
          errors={errors}
          required
        />
        <InputField
          label="Zip Code"
          id="zipcode"
          register={register}
          errors={errors}
          required
          pattern={/^[0-9]{5}$/}
        />
      </form>
    </div>
  );
};

const InputField = ({
  label,
  id,
  register,
  errors,
  required,
  pattern,
}: InputFieldProps) => (
  <div className="flex flex-col gap-[17px] w-full">
    <label className="text-base font-semibold" htmlFor={id}>
      {label}
    </label>
    <input
      type="text"
      className="border border-[#9F9F9F] rounded-lg focus:outline-none h-[70px] w-full text-base px-[14px]"
      id={id}
      {...register(id, {
        required: required ? `${label} is required` : false,
        pattern,
      })}
    />
    {errors[id] && (
      <p className="text-red-500 text-sm">{errors[id]?.message}</p>
    )}
  </div>
);

const SelectField = ({
  label,
  id,
  register,
  errors,
  required,
  children,
}: SelectFieldProps) => (
  <div className="flex flex-col gap-[17px] relative w-full">
    <label className="text-base font-semibold" htmlFor={id}>
      {label}
    </label>
    <div className="relative">
      <select
        id={id}
        {...register(id, {
          required: required ? `${label} is required` : false,
        })}
        className="border border-[#9F9F9F] rounded-lg focus:outline-none h-[70px] w-full text-base px-5 appearance-none"
      >
        <option value="" disabled>
          Select {label}
        </option>
        {children}
      </select>
      <span className="text-xl absolute right-6 top-1/2 transform -translate-y-1/2 cursor-pointer">
        <FaAngleDown />
      </span>
    </div>
    {errors[id] && (
      <p className="text-red-500 text-sm">{errors[id]?.message}</p>
    )}
  </div>
);

export default PaymentMethod;
