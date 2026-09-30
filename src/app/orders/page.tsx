"use client";

import React, { useEffect, useState } from "react";
import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import Image from "next/image";
import { fetchOrdersByUserEmail } from "@/app/Data/orderData";
import type { Order } from "@/app/Data/orderData";
import { useSession } from "next-auth/react";
import { fetchProducts, ProductCardData } from "../Data";
import Link from "next/link";

const StarRating = ({
  rating,
  onChange,
  readOnly = false,
}: {
  rating: number;
  onChange?: (n: number) => void;
  readOnly?: boolean;
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <span
        key={n}
        onClick={() => !readOnly && onChange?.(n)}
        className={`text-lg ${readOnly ? "" : "cursor-pointer"} ${n <= rating ? "text-yellow-500" : "text-gray-300"
          }`}
      >
        ★
      </span>
    ))}
  </div>
);

const OrderCard = ({
  order,
  type,
  selectionMode,
  selectedProducts,
  toggleProduct,
}: {
  order: Order;
  type: "receive" | "delivered" | "review";
  selectionMode?: boolean;
  selectedProducts?: string[];
  toggleProduct?: (id: string) => void;
}) => {
  const [products, setProducts] = useState<ProductCardData[]>([]);

  const [existingReviews, setExistingReviews] = useState<
    Record<string, { rating: number; comment: string }>
  >({});
  const [draftRating, setDraftRating] = useState<Record<string, number>>({});
  const [draftComment, setDraftComment] = useState<Record<string, string>>(
    {},
  );
  const [submittingProductId, setSubmittingProductId] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function loadProducts() {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if (type !== "review") return;

    const loadReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?orderId=${order.orderId}`);
        const data = await res.json();
        const map: Record<string, { rating: number; comment: string }> = {};
        (data.reviews ?? []).forEach(
          (r: { productId: string; rating: number; comment: string }) => {
            map[r.productId] = { rating: r.rating, comment: r.comment };
          },
        );
        setExistingReviews(map);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
    };

    loadReviews();
  }, [type, order.orderId]);

  const handleSubmitReview = async (productId: string) => {
    const rating = draftRating[productId] ?? 0;
    if (rating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }

    setSubmittingProductId(productId);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          productId,
          userName: `${order.user.firstname} ${order.user.lastname}`,
          rating,
          comment: draftComment[productId] ?? "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to submit review. Please try again.");
        return;
      }

      setExistingReviews((prev) => ({
        ...prev,
        [productId]: { rating, comment: draftComment[productId] ?? "" },
      }));
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingProductId(null);
    }
  };

  const steps = [
    "Pending",
    "Processing",
    "Dispatched",
    "Shipped",
    "Delivered",
  ];
  const currentIndex = steps.indexOf(order.status);

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-gray-800">Furniro</h3>
          <p
            className={`text-sm ${order.status === "Delivered"
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
                  className={`px-2 py-1 rounded-full ${index <= currentIndex
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
        const existingReview = existingReviews[item._id];

        return (
          <div
            key={item._id}
            className="py-4 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="flex items-start space-x-4 w-full lg:w-auto">
                {selectionMode &&
                  type === "delivered" &&
                  selectedProducts &&
                  toggleProduct && (
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(item._id)}
                      onChange={() => toggleProduct(item._id)}
                      className="mr-2"
                    />
                  )}
                <Link href={`/add-to-cart/${slug}`}>
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={item.productImage || "/placeholder-image.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/add-to-cart/${slug}`}>
                    <h4 className="font-medium text-gray-900 text-[13px] sm:text-sm line-clamp-2">
                      {item.title}
                    </h4>
                  </Link>
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
              </div>
            </div>

           
            {type === "review" && (
              <div className="mt-3 ml-0 lg:ml-24 border-t pt-3">
                {existingReview ? (
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">
                      ✓ You reviewed this item
                    </p>
                    <StarRating rating={existingReview.rating} readOnly />
                    {existingReview.comment && (
                      <p className="text-sm text-gray-600 mt-1">
                        {existingReview.comment}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Leave a Review
                    </p>
                    <StarRating
                      rating={draftRating[item._id] ?? 0}
                      onChange={(n) =>
                        setDraftRating((prev) => ({ ...prev, [item._id]: n }))
                      }
                    />
                    <textarea
                      placeholder="Write your review..."
                      value={draftComment[item._id] ?? ""}
                      onChange={(e) =>
                        setDraftComment((prev) => ({
                          ...prev,
                          [item._id]: e.target.value,
                        }))
                      }
                      className="w-full border p-2 rounded text-sm mt-2"
                    />
                    <button
                      onClick={() => handleSubmitReview(item._id)}
                      disabled={submittingProductId === item._id}
                      className="mt-2 bg-[#B88E2F] text-white px-4 py-2 rounded text-sm disabled:opacity-60"
                    >
                      {submittingProductId === item._id
                        ? "Submitting..."
                        : "Submit Review"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-gray-500">
          Ordered on {new Date(order.createdAt).toLocaleDateString()}
        </div>
        <div className="flex flex-col items-center gap-[6px]">
          <Link
            href={`/track-order?orderId=${order.orderId}`}
            className="text-sm text-blue-600 hover:text-blue-800 lg:block hidden"
          >
            View Details
          </Link>
        </div>
      </div>
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

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [isSavingGallery, setIsSavingGallery] = useState(false);
  const [hasGallery, setHasGallery] = useState(false);

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : prev.length < 8
          ? [...prev, productId]
          : prev,
    );
  };

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

  useEffect(() => {
    const checkExistingGallery = async () => {
      if (!session?.user?.email) return;

      try {
        const res = await fetch(`/api/gallery?email=${session.user.email}`);
        const data = await res.json();
        setHasGallery((data.gallery?.products?.length ?? 0) > 0);
      } catch (error) {
        console.error("Failed to check gallery:", error);
      }
    };

    checkExistingGallery();
  }, [session]);

  const createGallery = async (): Promise<boolean> => {
    if (selectedProducts.length < 4) {
      alert("Please select at least 4 products to create a gallery");
      return false;
    }

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: session?.user?.email,
          products: selectedProducts,
        }),
      });

      if (!res.ok) {
        alert("Failed to save gallery. Please try again.");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to save gallery:", error);
      alert("Failed to save gallery. Please try again.");
      return false;
    }
  };

  const handleSaveGallery = async () => {
    setIsSavingGallery(true);
    const success = await createGallery();
    setIsSavingGallery(false);

    if (success) {
      setHasGallery(true);
      setSelectionMode(false);
      setSelectedProducts([]);
    }

  };

  const handleGalleryMode = async () => {
    if (!selectionMode) {
      const res = await fetch(`/api/gallery?email=${session?.user?.email}`);
      const data = await res.json();

      if (data.gallery?.products) {
        setSelectedProducts(
          data.gallery.products.map((product: { _id: string }) => product._id),
        );
      }
    }

    setSelectionMode((prev) => !prev);
  };

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

  const toReceiveOrders = loading
    ? []
    : orders.filter((order) =>
      ["Pending", "Processing", "Dispatched", "Shipped"].includes(
        order.status,
      ),
    );

  const deliveredOrders = loading
    ? []
    : orders.filter((order) => order.status === "Delivered");

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
              className={`pb-2 text-sm font-medium ${activeTab === tab.key
                ? "border-b-2 border-[#B88E2F] text-[#B88E2F]"
                : "text-gray-500"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-52 rounded-lg bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
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

            {activeTab === "delivered" && (
              <div className="mb-4 flex gap-3">
                <button
                  onClick={handleGalleryMode}
                  className="bg-gray-800 text-white px-4 py-2 rounded"
                >
                  {selectionMode ? "Cancel" : hasGallery ? "Edit Gallery" : "Create Gallery"}
                </button>

                {selectionMode && (
                  <button
                    onClick={handleSaveGallery}
                    disabled={isSavingGallery}
                    className="bg-[#B88E2F] text-white px-4 py-2 rounded disabled:opacity-60"
                  >
                    {isSavingGallery
                      ? "Saving..."
                      : `Save Gallery (${selectedProducts.length}/8)`}
                  </button>
                )}
              </div>
            )}
            {activeTab === "delivered" &&
              (deliveredOrders.length > 0 ? (
                deliveredOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    type="delivered"
                    selectionMode={selectionMode}
                    selectedProducts={selectedProducts}
                    toggleProduct={toggleProduct}
                  />
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
