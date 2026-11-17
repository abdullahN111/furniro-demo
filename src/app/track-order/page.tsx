"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import jsPDF from "jspdf";
import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import ServiceBar from "@/app/components/shared/ServiceBar";
import { useToast } from "@/app/context/ToastContext";
import {
  FiSearch,
  FiCopy,
  FiDownload,
  FiCheckCircle,
  FiPackage,
  FiArrowRight,
} from "react-icons/fi";

interface OrderItem {
  _key: string;
  title: string;
  quantity: number;
  price: number;
}

interface OrderDetails {
  orderId: string;
  paymentMethod: string;
  paid?: boolean;
  paymentStatus?: string;
  status: string;
  total: number;
  user: string;
  items: OrderItem[];
  itemPrices?: number[];
  itemQuantities: number[];
}

const STEPS = ["Pending", "Processing", "Dispatched", "Shipped", "Delivered"];

function OrderTrackingContent() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [orderIdInput, setOrderIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const fetchOrderDetails = useCallback(async (orderId: string) => {
    const trimmed = orderId.trim();
    if (!trimmed) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || !data.order) {
        setOrderDetails(null);
        return;
      }

      const orderData = data.order;

      setOrderDetails({
        ...orderData,
        items: (orderData.items || []).map((item: OrderItem, index: number) => ({
          ...item,
          price: orderData.itemPrices?.[index] ?? item.price ?? 0,
          quantity: orderData.itemQuantities?.[index] || 1,
        })),
      });
    } catch (error) {
      console.error("Error tracking order:", error);
      setOrderDetails(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch("/api/account-info");
        const data = await res.json();
        if (!data.user) {
          router.push("/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    const orderId = searchParams.get("orderId");
    if (orderId) {
      setOrderIdInput(orderId);
      fetchOrderDetails(orderId);
    }

    checkUser();
  }, [searchParams, router, fetchOrderDetails]);

  const handleCopyOrderId = async () => {
    if (!orderDetails) return;
    try {
      await navigator.clipboard.writeText(orderDetails.orderId);
      showToast({
        message: `Order ID #${orderDetails.orderId} copied to clipboard`,
        type: "info",
      });
    } catch {
      showToast({ message: "Unable to copy Order ID", type: "error" });
    }
  };

  const handleDownloadInvoice = () => {
    if (!orderDetails) return;
    const pdf = new jsPDF();
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("FURNIRO — ORDER RECEIPT", 20, 22);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(`Order ID: #${orderDetails.orderId}`, 20, 34);
    pdf.text(`Status: ${orderDetails.status}`, 20, 41);
    pdf.text(`Payment Method: ${orderDetails.paymentMethod}`, 20, 48);

    pdf.line(20, 54, 190, 54);

    let y = 64;
    pdf.setFont("helvetica", "bold");
    pdf.text("Item", 20, y);
    pdf.text("Qty", 130, y);
    pdf.text("Price", 165, y);
    y += 8;

    pdf.setFont("helvetica", "normal");
    orderDetails.items.forEach((item) => {
      pdf.text(String(item.title).slice(0, 48), 20, y);
      pdf.text(String(item.quantity), 132, y);
      pdf.text(`$${Number(item.price * item.quantity).toFixed(2)}`, 165, y);
      y += 8;
    });

    pdf.line(20, y + 2, 190, y + 2);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text(
      `Total: $${Number(orderDetails.total).toFixed(2)}`,
      145,
      y + 12
    );

    pdf.save(`furniro-order-${orderDetails.orderId}.pdf`);
    showToast({
      message: "Receipt PDF downloaded!",
      type: "success",
    });
  };

  const currentStepIndex = orderDetails
    ? STEPS.indexOf(orderDetails.status)
    : -1;

  return (
    <section className="max-w-[1440px] mx-auto bg-white">
      <SecondaryHeader routeName="Track Order" />

      <div className="max-w-3xl mx-auto py-14 px-5 sm:px-8">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#B88E2F] bg-[#F9F1E7] px-3.5 py-1 rounded-full mb-3">
            Live Order Status
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Track Your Furniture Delivery
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Enter your 8-character Order ID below to view real-time shipment
            updates and download your receipt.
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchOrderDetails(orderIdInput);
          }}
          className="flex flex-col sm:flex-row gap-3 mb-10"
        >
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="Enter your Order ID (e.g. a1b2c3d4)"
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-300 focus:border-[#B88E2F] outline-none text-sm sm:text-base"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-12 px-8 rounded-xl bg-[#B88E2F] hover:bg-[#9f7924] text-white font-semibold text-sm sm:text-base transition-colors disabled:opacity-60"
          >
            {loading ? "Locating..." : "Track Order"}
          </button>
        </form>

        {/* Results Card */}
        {loading ? (
          <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
        ) : orderDetails ? (
          <div className="bg-[#FCF8F3] border border-[#f0e4d3] rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
            {/* Top Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#e5d6c0]">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Order #{orderDetails.orderId}
                  </h2>
                  <button
                    type="button"
                    onClick={handleCopyOrderId}
                    title="Copy Order ID"
                    className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-[#B88E2F] transition-colors"
                  >
                    <FiCopy className="text-sm" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Payment Method:{" "}
                  <strong className="text-gray-800">
                    {orderDetails.paymentMethod}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#B88E2F] text-xs sm:text-sm font-semibold text-gray-800 transition-colors shadow-2xs"
              >
                <FiDownload className="text-[#B88E2F]" />
                <span>Download Receipt PDF</span>
              </button>
            </div>

            {/* 5-Step Progress Timeline */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                Shipment Progress
              </p>
              <div className="grid grid-cols-5 gap-2">
                {STEPS.map((step, idx) => {
                  const completed = idx <= currentStepIndex;
                  return (
                    <div
                      key={step}
                      className="flex flex-col items-center text-center"
                    >
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mb-2 transition-colors ${
                          completed
                            ? "bg-[#B88E2F] text-white shadow-xs"
                            : "bg-white border border-gray-200 text-gray-400"
                        }`}
                      >
                        {completed ? <FiCheckCircle /> : idx + 1}
                      </div>
                      <span
                        className={`text-[11px] sm:text-xs font-semibold ${
                          completed ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ordered Items */}
            <div className="bg-white rounded-xl border border-[#f0e4d3] p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
                Items in This Shipment
              </h3>
              <div className="divide-y divide-gray-100">
                {orderDetails.items.map((item, idx) => (
                  <div
                    key={item._key || idx}
                    className="py-3 flex items-center justify-between gap-4 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Quantity: {item.quantity} &times; $
                        {Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <span className="font-bold text-gray-900">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">
                  Order Total
                </span>
                <span className="text-xl font-bold text-[#B88E2F]">
                  ${Number(orderDetails.total).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                href="/orders"
                className="text-sm font-semibold text-gray-600 hover:text-[#B88E2F] transition-colors"
              >
                &larr; View All My Orders
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B88E2F] hover:underline"
              >
                <span>Continue Shopping</span>
                <FiArrowRight />
              </Link>
            </div>
          </div>
        ) : searched ? (
          <div className="bg-[#FCF8F3] border border-[#f0e4d3] rounded-2xl p-10 text-center">
            <FiPackage className="text-3xl text-[#B88E2F] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">
              Order Not Found
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              We couldn&apos;t find an order matching &ldquo;{orderIdInput}
              &rdquo;. Please double-check your Order ID or view your history on
              the Orders page.
            </p>
            <Link
              href="/orders"
              className="mt-5 inline-block bg-[#B88E2F] hover:bg-[#9f7924] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Go to My Orders
            </Link>
          </div>
        ) : null}
      </div>

      <ServiceBar />
    </section>
  );
}

const OrderTracking = () => {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1440px] mx-auto py-20 text-center text-gray-500">
          Loading Order Tracker...
        </div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
};

export default OrderTracking;
