"use client";

import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import PolicyLayout from "@/app/components/PolicyLayout";
import ContactSection from "@/app/components/ContactSection";
import { returnPolicySections, returnProcess } from "../Data";

const ReturnPolicy = () => {
  return (
    <section className="bg-[#FFFFFF] max-w-[1440px] mx-auto mb-12">
      <SecondaryHeader routeName="Return Policy" />

      <div className="max-w-6xl mx-auto p-4">
        <PolicyLayout sections={returnPolicySections}>
          <div
            id="introduction"
            className="bg-gradient-to-r from-[#FFE0B2] to-[#FFC1C1] p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Return Policy
            </h2>
            <p className="text-gray-700">
              We want you to be completely satisfied with your Furniro purchase.
              If you&apos;re not happy with your order, we&apos;re here to help.
            </p>
          </div>

          <div
            id="return-window"
            className="bg-gradient-to-r from-[#CDE7FE] to-[#A5D6FF] p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
              30-Day Return Window
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-md shadow-md">
                <h3 className="font-semibold text-lg text-[#B88E2F] mb-2">
                  Standard Returns
                </h3>
                <p className="text-gray-700">
                  You have 30 days from the delivery date to return items in
                  original condition.
                </p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-md">
                <h3 className="font-semibold text-lg text-[#B88E2F] mb-2">
                  Extended Holiday Returns
                </h3>
                <p className="text-gray-700">
                  Items purchased between November 1st and December 24th can be
                  returned until January 31st.
                </p>
              </div>
            </div>
          </div>

          <div
            id="eligibility"
            className="bg-gradient-to-r from-[#FDE2E4] to-[#FAD1D1] p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
              Return Eligibility
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-md shadow-md">
                <h3 className="font-semibold text-lg text-green-600 mb-2">
                  ✓ Eligible Items
                </h3>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• Unused and in original packaging</li>
                  <li>• All tags and labels attached</li>
                  <li>• Assembly required items must be unassembled</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-md shadow-md">
                <h3 className="font-semibold text-lg text-red-600 mb-2">
                  ✗ Non-Returnable
                </h3>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• Custom or made-to-order items</li>
                  <li>• Final sale items (marked as such)</li>
                  <li>• Damaged or used products</li>
                </ul>
              </div>
            </div>
          </div>

          <div
            id="process"
            className="bg-gradient-to-r from-[#FFF1D0] to-[#FFD59E] p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
              Simple Return Process
            </h2>
            <div className="space-y-4">
              {returnProcess.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 bg-white p-4 rounded-md shadow-md"
                >
                  <div className="bg-[#B88E2F] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            id="refunds"
            className="bg-gradient-to-r from-[#D4EDDA] to-[#C3E6CB] p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
              Refund Information
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-md shadow-md">
                <h3 className="font-semibold text-lg text-[#B88E2F] mb-2">
                  Processing Time
                </h3>
                <p className="text-gray-700">
                  Refunds are processed within 5-7 business days after we
                  receive your return.
                </p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-md">
                <h3 className="font-semibold text-lg text-[#B88E2F] mb-2">
                  Original Payment Method
                </h3>
                <p className="text-gray-700">
                  Refunds are issued to your original payment method. Credit
                  card refunds may take 1-2 billing cycles to appear.
                </p>
              </div>
            </div>
          </div>

          <div
            id="exchanges"
            className="bg-gradient-to-r from-[#E2E3E5] to-[#D6D8DB] p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
              Exchanges
            </h2>
            <p className="text-gray-700 mb-4">
              We currently offer exchanges for items of equal or greater value.
              For size or color exchanges, please return the original item and
              place a new order.
            </p>
            <div className="bg-white p-4 rounded-md shadow-md">
              <p className="text-gray-700">
                <strong>Note:</strong> Exchanges are subject to product
                availability. If your desired item is out of stock, we&apos;ll
                process a refund instead.
              </p>
            </div>
          </div>

          <ContactSection
            email="returns@furniro.com"
            phone="1-800-FURNIRO (1-800-387-6476)"
            address="123 Furniture Lane, Design District, FD 12345"
          />
        </PolicyLayout>
      </div>
    </section>
  );
};

export default ReturnPolicy;
