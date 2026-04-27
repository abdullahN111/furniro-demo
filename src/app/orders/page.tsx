"use client";

import React, { useEffect, useState } from "react";
import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import Image from "next/image";
import { fetchOrdersByUserEmail } from "@/app/Data/orderData";
import type { Order } from "@/app/Data/orderData";
import { useSession } from "next-auth/react";
import { fetchProducts, ProductCardData } from "../Data";
import Link from "next/link";

const OrderCard = ({
  order,
  type,
}: {
  order: Order;
  type: "receive" | "delivered" | "review";
}) => {
  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    async function loadProducts() {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
    }

    loadProducts();
  }, []);
  const steps = ["Pending", "Processing", "Dispatched", "Shipped", "Delivered"];
  const currentIndex = steps.indexOf(order.status);
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-gray-800">Furniro</h3>
          <p
            className={`text-sm ${
              order.status === "Delivered"
                ? "text-green-600"
                : order.status === "Pending"
                  ? "text-yellow-600"
                  : "text-blue-600"
            }`}
          >
            {order.status}
          </p>
          <div className="flex items-center gap-2 text-xs mt-2 flex-wrap">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <span
                  className={`px-2 py-1 rounded-full ${
                    index <= currentIndex
                      ? "bg-[#B88E2F] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step}
                </span>

                {index < steps.length - 1 && (
                  <div className="w-4 h-[2px] bg-gray-300 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="text-sm text-gray-500">Order ID: {order.orderId}</div>
      </div>

      {order.items.map((item, index) => {
        const product = products.find((p) => p._id === item._id);
        const slug = product?.slug.current;

        return (
          <div
            key={item._id}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-4 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-start space-x-4 w-full lg:w-auto">
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={item.productImage || "/placeholder-image.jpg"}
                  alt={item.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-[13px] sm:text-sm line-clamp-2">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Color Family: White Black
                </p>
                <p className="text-xs text-gray-500">Size: Int: LM</p>
              </div>
            </div>

            <div className="flex justify-between w-full lg:w-auto mt-4 lg:mt-0 lg:flex-col lg:items-end">
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  Rs. {order.itemPrices[index] * order.itemQuantities[index]}
                </p>
                <p className="text-sm text-gray-500">
                  Qty: {order.itemQuantities[index]}
                </p>
              </div>
              <div className="lg:mt-2">
                <Link
                  href={`/add-to-cart/${slug}`}
                  className="text-xs text-blue-600 hover:text-blue-800 lg:block hidden"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-gray-500">
          Ordered on {new Date(order.createdAt).toLocaleDateString()}
        </div>
        <div className="flex">
          <button className="px-3 py-2 text-sm bg-[#B88E2F] text-white rounded-md hover:bg-[#a57d28]">
            Contact Seller
          </button>
        </div>
      </div>
      {type === "review" && (
        <div className="mt-3 border-t pt-4">
          <p className="text-sm font-medium mb-2">Leave a Review</p>

          <div className="flex gap-1 mb-2">
            {"★★★★★".split("").map((_, i) => (
              <span
                key={i}
                className="cursor-pointer text-gray-400 hover:text-yellow-500"
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            placeholder="Write your review..."
            className="w-full border p-2 rounded text-sm"
          />

          <button className="mt-2 bg-[#B88E2F] text-white px-4 py-2 rounded text-sm">
            Submit Review
          </button>
        </div>
      )}
    </div>
  );
};

const Order = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<
    "receive" | "delivered" | "review"
  >("receive");

  useEffect(() => {
    const loadOrders = async () => {
      if (status === "loading") return;

      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        const ordersData = await fetchOrdersByUserEmail(session.user.email);
        setOrders(ordersData);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [session, status]);

  if (status === "loading" || loading) {
    return (
      <section className="max-w-[1440px] bg-white container mx-auto px-3 sm:px-6 lg:px-20 py-8">
        <SecondaryHeader routeName="Orders" />
        <div className="py-6 flex justify-center">
          <div className="animate-pulse text-gray-500">Loading orders...</div>
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="max-w-[1440px] bg-white container mx-auto px-3 sm:px-6 lg:px-20 py-8">
        <SecondaryHeader routeName="Orders" />
        <div className="py-6 flex justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700">
              Please log in to view your orders
            </h3>
            <p className="text-gray-500 mt-2">
              You need to be logged in to see your order history.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const toReceiveOrders = orders.filter((order) =>
    ["Pending", "Processing", "Dispatched", "Shipped"].includes(order.status),
  );

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered",
  );

  const reviewOrders = deliveredOrders;
  return (
    <section className="max-w-[1440px] bg-white container mx-auto px-3 sm:px-6 lg:px-20 py-8">
      <SecondaryHeader routeName="Orders" />
      <div className="py-6">
        <div className="flex gap-4 border-b mb-4">
          {[
            { key: "receive", label: `To Receive (${toReceiveOrders.length})` },
            {
              key: "delivered",
              label: `Delivered (${deliveredOrders.length})`,
            },
            { key: "review", label: `To Review (${reviewOrders.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() =>
                setActiveTab(tab.key as "receive" | "delivered" | "review")
              }
              className={`pb-2 text-sm font-medium ${
                activeTab === tab.key
                  ? "border-b-2 border-[#B88E2F] text-[#B88E2F]"
                  : "text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-700">
              No orders found
            </h3>
            <p className="text-gray-500 mt-2">
              You haven&apos;t placed any orders yet.
            </p>
          </div>
        ) : (
          <div>
            {activeTab === "receive" &&
              (toReceiveOrders.length > 0 ? (
                toReceiveOrders.map((order) => (
                  <OrderCard key={order._id} order={order} type="receive" />
                ))
              ) : (
                <p className="text-gray-500 text-center">
                  No orders to receive
                </p>
              ))}

            {activeTab === "delivered" &&
              (deliveredOrders.length > 0 ? (
                deliveredOrders.map((order) => (
                  <OrderCard key={order._id} order={order} type="delivered" />
                ))
              ) : (
                <p className="text-gray-500 text-center">No delivered orders</p>
              ))}

            {activeTab === "review" &&
              (reviewOrders.length > 0 ? (
                reviewOrders.map((order) => (
                  <OrderCard key={order._id} order={order} type="review" />
                ))
              ) : (
                <p className="text-gray-500 text-center">No orders to review</p>
              ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Order;
