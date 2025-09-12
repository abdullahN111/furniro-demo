"use client";

import React, { useEffect, useState } from "react";
import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import Image from "next/image";
import { fetchOrdersByUserEmail } from "@/app/Data/orderData";
import type { Order } from "@/app/Data/orderData";
import { useSession } from "next-auth/react";
import { fetchProducts, ProductCardData } from "../Data";
import Link from "next/link";

const OrderCard = ({ order }: { order: Order }) => {
  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    async function loadProducts() {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
    }

    loadProducts();
  }, []);
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-gray-800">Furniro</h3>
          <p
            className={`text-[13px] sm:text-sm ${order.status === "Completed" ? "text-green-600" : order.status === "Cancelled" ? "text-red-600" : "text-blue-600"}`}
          >
            {order.status}
          </p>
        </div>
        <div className="text-[13px] sm:text-sm text-gray-500">Order ID: {order.orderId}</div>
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
        <div className="text-[13px] sm:text-sm text-gray-500">
          Ordered on {new Date(order.createdAt).toLocaleDateString()}
        </div>
        <div className="flex">
          <button className="px-[10px] sm:px-4 py-[7px] sm:py-[10px] text-[13px] sm:text-sm bg-[#B88E2F] text-white rounded-md hover:bg-[#a57d28]">
            Contact Seller
          </button>
        </div>
      </div>
    </div>
  );
};

const Order = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

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
      <section className="max-w-[1440px] bg-white container mx-auto px-3 sm:px-6 lg:px-20 py-10">
        <SecondaryHeader routeName="Orders" />
        <div className="py-8 flex justify-center">
          <div className="animate-pulse text-gray-500">Loading orders...</div>
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="max-w-[1440px] bg-white container mx-auto px-3 sm:px-6 lg:px-20 py-10">
        <SecondaryHeader routeName="Orders" />
        <div className="py-8 flex justify-center">
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

  return (
    <section className="max-w-[1440px] bg-white container mx-auto px-3 sm:px-6 lg:px-20 py-10">
      <SecondaryHeader routeName="Orders" />
      <div className="py-8">
        {orders.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-700">
              No orders found
            </h3>
            <p className="text-gray-500 mt-2">
              You haven&apos;t placed any orders yet.
            </p>
          </div>
        ) : (
          orders.map((order) => <OrderCard key={order._id} order={order} />)
        )}
      </div>
    </section>
  );
};

export default Order;
