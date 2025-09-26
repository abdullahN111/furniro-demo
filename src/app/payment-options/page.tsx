"use client";

import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import PolicyLayout from "@/app/components/PolicyLayout";
import ContactSection from "@/app/components/ContactSection";
import { paymentOptionsSections } from "../Data";

const PaymentOptions = () => {
  return (
    <section className="bg-[#FFFFFF] max-w-[1440px] mx-auto mb-12">
      <SecondaryHeader routeName="Payment Options" />

      <div className="max-w-6xl mx-auto p-4">
        <PolicyLayout sections={paymentOptionsSections}>
          <div
            id="cash-on-delivery"
            className="bg-gradient-to-r from-[#FFF3CD] to-[#FFE8A1] p-4 lg:p-8 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
              Cash on Delivery
            </h2>
            <p className="text-gray-700 leading-relaxed">
              With our <strong>Cash on Delivery (COD)</strong> option, you can
              pay for your order in cash at the time of delivery. This method is
              secure, convenient, and requires no advance payment.
            </p>
            <ul className="list-disc list-inside mt-4 text-gray-700 space-y-2">
              <li>No need for credit or debit cards</li>
              <li>Pay only when your order arrives</li>
              <li>Ideal for first-time customers</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Please ensure you have the exact amount available, as our delivery
              staff may not carry change.
            </p>
          </div>

          <div
            id="credit-card"
            className="bg-gradient-to-r from-[#CCE5FF] to-[#99CCFF] p-4 lg:p-8 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
              Credit Card
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Pay easily and securely using your credit card. All transactions
              are processed through our trusted payment partners with industry-
              standard encryption to protect your information.
            </p>
            <ul className="list-disc list-inside mt-4 text-gray-700 space-y-2">
              <li>We accept Visa, MasterCard, and American Express</li>
              <li>Your card details are never stored on our servers</li>
              <li>Instant confirmation once payment is successful</li>
            </ul>
            <p className="text-gray-700 mt-4">
              For added security, some transactions may require{" "}
              <strong>3D Secure verification</strong> (OTP or password).
            </p>
          </div>

          <ContactSection
            email="payments@furniro.com"
            phone="1-800-FURNIRO (1-800-387-6476)"
            address="123 Furniture Lane, Design District, FD 12345"
          />
        </PolicyLayout>
      </div>
    </section>
  );
};

export default PaymentOptions;
