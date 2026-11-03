"use client";

import { useForm, UseFormRegister, FieldErrors } from "react-hook-form";
import { FaAngleDown } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useToast } from "@/app/context/ToastContext";

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
  placeholder?: string;
  pattern?: { value: RegExp; message: string };
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

const COUNTRY_REGIONS: Record<string, string[]> = {
  "United States": [
    "California",
    "Florida",
    "New York",
    "Texas",
    "Illinois",
    "Washington",
    "Other",
  ],
  Pakistan: ["Sindh", "Punjab", "KPK", "Balochistan", "Islamabad Capital"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  Canada: ["Ontario", "British Columbia", "Quebec", "Alberta", "Other"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Other"],
  India: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Other"],
};

const PaymentMethod = ({
  selectedOption,
  onOrderCreated,
  setIsProcessing,
  cartItems,
  cartTotal,
}: PaymentMethodProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      country: "Pakistan",
      province: "Sindh",
    },
  });

  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();
  const { showToast } = useToast();

  const selectedCountry = watch("country") || "Pakistan";
  const provinces = COUNTRY_REGIONS[selectedCountry] || ["Other"];

  useEffect(() => {
    if (session?.user?.email) {
      setValue("email", session.user.email);
    }
    if (session?.user?.name) {
      const parts = session.user.name.trim().split(" ");
      if (parts[0]) setValue("firstname", parts[0]);
      if (parts.length > 1) setValue("lastname", parts.slice(1).join(" "));
    }
  }, [session, setValue]);

  const submitHandler = async (data: FormData) => {
    if (cartItems.length === 0) {
      showToast({
        message: "Your checkout list is empty",
        type: "error",
      });
      return;
    }

    setIsProcessing(true);
    const orderId = uuidv4().slice(0, 8);

    const baseOrderDetails = {
      orderId,
      user: { ...data },
      items: cartItems.map((item) => ({
        productId: item.id,
        price:
          typeof item.price === "string"
            ? parseFloat(item.price.replace(/[^0-9.]+/g, "")) || 0
            : Number(item.price),
        quantity: item.quantity,
      })),
      total: cartTotal,
    };

    try {
      if (selectedOption === "Stripe") {
        if (!stripe || !elements) {
          showToast({
            message: "Stripe payment form is still loading. Please wait.",
            type: "error",
          });
          setIsProcessing(false);
          return;
        }

        const { error: submitError } = await elements.submit();
        if (submitError) {
          showToast({
            message: submitError.message || "Please check your card details",
            type: "error",
          });
          setIsProcessing(false);
          return;
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });

        if (error) {
          showToast({
            message: error.message || "Payment declined. Please try again.",
            type: "error",
          });
          setIsProcessing(false);
          return;
        }

        if (paymentIntent?.status !== "succeeded") {
          showToast({
            message: `Payment status: ${paymentIntent?.status || "incomplete"}`,
            type: "error",
          });
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
          showToast({
            message: result.message || "Failed to save order",
            type: "error",
          });
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
          showToast({
            message: result.message || "Order submission failed",
            type: "error",
          });
          setIsProcessing(false);
        }
      }
    } catch (err) {
      console.error("Order submission failed", err);
      showToast({
        message: "Network error while placing your order. Please try again.",
        type: "error",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-xs">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Billing & Shipping Details
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter the delivery address where you would like your furniture
          delivered.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(submitHandler)}
        id="checkout-form"
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField
            label="First Name"
            id="firstname"
            placeholder="e.g. Abdullah"
            register={register}
            errors={errors}
            required
          />
          <InputField
            label="Last Name"
            id="lastname"
            placeholder="e.g. Nadeem"
            register={register}
            errors={errors}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField
            label="Phone Number"
            id="phone"
            placeholder="e.g. 03001234567"
            register={register}
            errors={errors}
            required
            pattern={{
              value: /^[0-9+\-\s()]{7,18}$/,
              message: "Enter a valid phone number (7–18 digits)",
            }}
          />

          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-semibold text-gray-800">
              Email Address
            </label>
            <input
              type="email"
              value={session?.user?.email || ""}
              readOnly
              className="border border-gray-200 rounded-xl h-12 w-full text-sm px-4 bg-gray-100 text-gray-600 cursor-not-allowed"
            />
            <input
              type="hidden"
              {...register("email")}
              value={session?.user?.email || ""}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SelectField
            label="Country / Region"
            id="country"
            register={register}
            errors={errors}
            required
          >
            {Object.keys(COUNTRY_REGIONS).map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="State / Province"
            id="province"
            register={register}
            errors={errors}
            required
          >
            {provinces.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField
            label="Town / City"
            id="city"
            placeholder="e.g. Karachi"
            register={register}
            errors={errors}
            required
          />
          <InputField
            label="Postal / Zip Code"
            id="zipcode"
            placeholder="e.g. 75500"
            register={register}
            errors={errors}
            required
            pattern={{
              value: /^[0-9A-Za-z\-\s]{4,10}$/,
              message: "Enter a valid 4–10 character postal/zip code",
            }}
          />
        </div>

        <InputField
          label="Street Address"
          id="streetaddress"
          placeholder="House number, street name, apartment or suite"
          register={register}
          errors={errors}
          required
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
  placeholder,
  pattern,
}: InputFieldProps) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-semibold text-gray-800" htmlFor={id}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      placeholder={placeholder}
      className={`border rounded-xl focus:outline-none h-12 w-full text-sm px-4 transition-colors ${
        errors[id]
          ? "border-red-400 focus:border-red-500"
          : "border-gray-300 focus:border-[#B88E2F]"
      }`}
      id={id}
      {...register(id, {
        required: required ? `${label} is required` : false,
        pattern,
      })}
    />
    {errors[id] && (
      <p className="text-red-500 text-xs font-medium">{errors[id]?.message}</p>
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
  <div className="flex flex-col gap-2 relative w-full">
    <label className="text-sm font-semibold text-gray-800" htmlFor={id}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        id={id}
        {...register(id, {
          required: required ? `${label} is required` : false,
        })}
        className="border border-gray-300 focus:border-[#B88E2F] rounded-xl focus:outline-none h-12 w-full text-sm px-4 appearance-none bg-white"
      >
        {children}
      </select>
      <span className="text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <FaAngleDown />
      </span>
    </div>
    {errors[id] && (
      <p className="text-red-500 text-xs font-medium">{errors[id]?.message}</p>
    )}
  </div>
);

export default PaymentMethod;
