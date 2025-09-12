"use client";

import { useForm, UseFormRegister, FieldErrors } from "react-hook-form";
import { FaAngleDown } from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

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

interface PaymentMethodProps {
  selectedOption: string;
  onStripePayment: (formData: FormData) => Promise<void>;
}

const PaymentMethod = ({ selectedOption, onStripePayment }: PaymentMethodProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const { cartItems, clearCart } = useCart();
  const router = useRouter();

  const submitHandler = async (data: FormData) => {
    if (selectedOption === "Stripe") {
      
      await onStripePayment(data);
    } else {
     
      const orderId = uuidv4().slice(0, 8);
      const orderDetails = {
        orderId,
        user: { ...data },
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

      console.log("Submitting order with details:", orderDetails);

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
        }
      } catch (error) {
        console.error("Order submission failed", error);
      }
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

        <InputField
          label="Street Address"
          id="streetaddress"
          register={register}
          errors={errors}
          required
        />
        <InputField
          label="Town / City"
          id="city"
          register={register}
          errors={errors}
          required
        />

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
          label="Zip Code"
          id="zipcode"
          register={register}
          errors={errors}
          required
          pattern={/^[0-9]{5}$/}
        />
        <InputField
          label="Phone"
          id="phone"
          register={register}
          errors={errors}
          required
          pattern={/^[0-9]+$/}
        />
        <InputField
          label="Email"
          id="email"
          register={register}
          errors={errors}
          required
          pattern={/^[^\s@]+@[^\s@]+\.[^\s@]+$/}
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
