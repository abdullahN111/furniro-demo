"use client";

import React, { useEffect, useState } from "react";
import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import ServiceBar from "@/app/components/shared/ServiceBar";
import Image from "next/image";
import type { Order } from "@/app/Data/orderData";
import { useSession } from "next-auth/react";
import { fetchProducts, ProductCardData } from "../Data";
import { useToast } from "@/app/context/ToastContext";
import Link from "next/link";
import {
  FiPackage,
  FiCheckCircle,
  FiStar,
  FiExternalLink,
  FiImage,
  FiShoppingBag,
} from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";

const StarRating = ({
  rating,
  onChange,
  readOnly = false,
}: {
  rating: number;
  onChange?: (n: number) => void;
  readOnly?: boolean;
}) => (
  <div className="inline-flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={readOnly}
        onClick={() => !readOnly && onChange?.(n)}
        className={`text-lg ${
          readOnly
            ? "cursor-default"
            : "cursor-pointer hover:scale-110 transition-transform"
        } ${n <= rating ? "text-[#FFC700]" : "text-gray-300"}`}
      >
        {n <= rating ? <FaStar /> : <FaRegStar />}
      </button>
    ))}
  </div>
);

const OrderCard = ({
  order,
  products,
  type,
  selectionMode,
  selectedProducts,
  toggleProduct,
}: {
  order: Order;
  products: ProductCardData[];
  type: "receive" | "delivered" | "review";
  selectionMode?: boolean;
  selectedProducts?: string[];
  toggleProduct?: (id: string) => void;
}) => {
  const { showToast } = useToast();
  const [existingReviews, setExistingReviews] = useState<
    Record<string, { rating: number; comment: string }>
  >({});
  const [draftRating, setDraftRating] = useState<Record<string, number>>({});
  const [draftComment, setDraftComment] = useState<Record<string, string>>({});
  const [submittingProductId, setSubmittingProductId] = useState<string | null>(
    null
  );

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
          }
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
      showToast({
        message: "Please select a star rating before submitting",
        type: "error",
      });
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
          userName: `${order.user.firstname} ${order.user.lastname}`.trim(),
          rating,
          comment: draftComment[productId] ?? "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast({
          message: data.error || "Failed to submit review",
          type: "error",
        });
        return;
      }

      setExistingReviews((prev) => ({
        ...prev,
        [productId]: { rating, comment: draftComment[productId] ?? "" },
      }));

      showToast({
        message: "Your verified review has been published!",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to submit review:", err);
      showToast({
        message: "Network error while submitting review",
        type: "error",
      });
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
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-5 shadow-2xs hover:shadow-md transition-shadow">
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Order #{order.orderId}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                order.status === "Delivered"
                  ? "bg-emerald-50 text-emerald-700"
                  : order.status === "Pending"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-[#F9F1E7] text-[#B88E2F]"
              }`}
            >
              {order.status}
            </span>
            {order.paymentMethod && (
              <span className="text-xs text-gray-500">
                &bull; {order.paymentMethod}
              </span>
            )}
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                order.paid ||
                order.paymentStatus === "Paid" ||
                order.paymentMethod === "Stripe" ||
                order.status === "Delivered"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {order.paid ||
              order.paymentStatus === "Paid" ||
              order.paymentMethod === "Stripe" ||
              order.status === "Delivered"
                ? "Paid"
                : "Pay on Delivery"}
            </span>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-1.5 text-[11px] flex-wrap pt-1">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-semibold ${
                    index <= currentIndex
                      ? "bg-[#B88E2F] text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-3 sm:w-5 h-[2px] mx-1 ${
                      index < currentIndex ? "bg-[#B88E2F]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs text-gray-400">Order Total</p>
          <p className="text-lg font-bold text-[#B88E2F]">
            ${Number(order.total || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-100">
        {order.items.filter(Boolean).map((item, index) => {
          const product = products.find((p) => p._id === item._id);
          const slug = product?.slug?.current || item._id;
          const existingReview = existingReviews[item._id];
          const unitPrice = Number(order.itemPrices?.[index] ?? item.price ?? 0);
          const qty = Number(order.itemQuantities?.[index] ?? 1);

          return (
            <div key={`${item._id}-${index}`} className="py-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                  {selectionMode &&
                    type === "delivered" &&
                    selectedProducts &&
                    toggleProduct && (
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(item._id)}
                        onChange={() => toggleProduct(item._id)}
                        className="w-4 h-4 accent-[#B88E2F] rounded shrink-0"
                      />
                    )}
                  <Link
                    href={`/product/${slug}`}
                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F9F1E7] shrink-0 border border-gray-100"
                  >
                    <Image
                      src={item.productImage || "/placeholder-image.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/product/${slug}`}>
                      <h4 className="font-bold text-gray-900 hover:text-[#B88E2F] transition-colors text-sm sm:text-base truncate">
                        {item.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      Unit Price: ${unitPrice.toFixed(2)} &bull; Quantity: {qty}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 pl-20 sm:pl-0">
                  <p className="font-bold text-gray-900 text-sm sm:text-base">
                    ${(unitPrice * qty).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Review Drawer inside "To Review" Tab */}
              {type === "review" && (
                <div className="mt-4 sm:ml-24 bg-[#FCF8F3] border border-[#f0e4d3] rounded-xl p-4">
                  {existingReview ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <FiCheckCircle /> You reviewed this piece
                        </span>
                        <StarRating rating={existingReview.rating} readOnly />
                      </div>
                      {existingReview.comment && (
                        <p className="text-sm text-gray-700 mt-1">
                          &ldquo;{existingReview.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
                          Rate & Review This Product
                        </p>
                        <StarRating
                          rating={draftRating[item._id] ?? 0}
                          onChange={(n) =>
                            setDraftRating((prev) => ({
                              ...prev,
                              [item._id]: n,
                            }))
                          }
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Share your thoughts on craftsmanship, comfort, and style..."
                        value={draftComment[item._id] ?? ""}
                        onChange={(e) =>
                          setDraftComment((prev) => ({
                            ...prev,
                            [item._id]: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-200 focus:border-[#B88E2F] outline-none bg-white p-3 rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleSubmitReview(item._id)}
                        disabled={submittingProductId === item._id}
                        className="bg-[#B88E2F] hover:bg-[#9f7924] text-white font-semibold px-5 py-2 rounded-lg text-xs sm:text-sm transition-colors disabled:opacity-60"
                      >
                        {submittingProductId === item._id
                          ? "Publishing..."
                          : "Submit Verified Review"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap justify-between items-center gap-3 pt-4 mt-2 border-t border-gray-100 text-xs sm:text-sm">
        <span className="text-gray-500">
          Placed on{" "}
          {new Date(order.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
        <Link
          href={`/track-order?orderId=${order.orderId}`}
          className="inline-flex items-center gap-1.5 font-semibold text-[#B88E2F] hover:underline"
        >
          <span>Track Order & Receipt</span>
          <FiExternalLink />
        </Link>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const { showToast } = useToast();
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
          : prev
    );
  };

  useEffect(() => {
    const loadData = async () => {
      if (status === "loading") return;

      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        const [orderRes, fetchedProducts] = await Promise.all([
          fetch("/api/order", { cache: "no-store" }),
          fetchProducts(),
        ]);
        const orderJson = orderRes.ok ? await orderRes.json() : { orders: [] };
        setOrders(Array.isArray(orderJson.orders) ? orderJson.orders : []);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  const handleSaveGallery = async () => {
    if (selectedProducts.length < 4) {
      showToast({
        message: "Please select at least 4 delivered products for your gallery",
        type: "error",
      });
      return;
    }

    setIsSavingGallery(true);
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
        showToast({
          message: "Failed to save gallery. Please try again.",
          type: "error",
        });
        return;
      }

      setHasGallery(true);
      setSelectionMode(false);
      setSelectedProducts([]);
      showToast({
        message: "Your #FuniroFurniture gallery has been updated on the Home page!",
        type: "success",
        actionLabel: "View Home",
        actionHref: "/",
      });
    } catch {
      showToast({
        message: "Network error while saving gallery",
        type: "error",
      });
    } finally {
      setIsSavingGallery(false);
    }
  };

  const handleGalleryMode = async () => {
    if (!selectionMode) {
      const res = await fetch(`/api/gallery?email=${session?.user?.email}`);
      const data = await res.json();

      if (data.gallery?.products) {
        setSelectedProducts(
          data.gallery.products.map((product: { _id: string }) => product._id)
        );
      }
    }

    setSelectionMode((prev) => !prev);
  };

  if (status !== "loading" && !session) {
    return (
      <section className="max-w-[1440px] bg-white mx-auto">
        <SecondaryHeader routeName="Orders" />
        <div className="py-20 px-4 flex justify-center">
          <div className="max-w-md w-full text-center bg-[#FCF8F3] border border-[#f0e4d3] rounded-2xl p-10">
            <FiShoppingBag className="text-3xl text-[#B88E2F] mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-900">
              Sign In to View Your Orders
            </h3>
            <p className="text-sm text-gray-500 mt-2 mb-6">
              Track active shipments, download receipts, and review delivered
              furniture pieces.
            </p>
            <Link
              href="/login"
              className="inline-block bg-[#B88E2F] hover:bg-[#9f7924] text-white font-semibold text-sm px-8 py-3 rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
        <ServiceBar />
      </section>
    );
  }

  const toReceiveOrders = loading
    ? []
    : orders.filter((order) =>
        ["Pending", "Processing", "Dispatched", "Shipped"].includes(
          order.status
        )
      );

  const deliveredOrders = loading
    ? []
    : orders.filter((order) => order.status === "Delivered");

  const reviewOrders = deliveredOrders;

  return (
    <section className="max-w-[1440px] bg-white mx-auto">
      <SecondaryHeader routeName="Orders" />

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
        {/* Tabs */}
        <div className="flex flex-wrap gap-3 sm:gap-6 border-b border-gray-200 mb-8">
          {[
            {
              key: "receive",
              label: `In Progress (${toReceiveOrders.length})`,
              icon: FiPackage,
            },
            {
              key: "delivered",
              label: `Delivered (${deliveredOrders.length})`,
              icon: FiCheckCircle,
            },
            {
              key: "review",
              label: `To Review (${reviewOrders.length})`,
              icon: FiStar,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  setActiveTab(tab.key as "receive" | "delivered" | "review")
                }
                className={`pb-3.5 px-2 text-sm sm:text-base font-bold flex items-center gap-2 transition-colors relative ${
                  active
                    ? "text-[#B88E2F] after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-[#B88E2F] after:rounded-full"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-52 rounded-2xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-[#FCF8F3] border border-[#f0e4d3] rounded-2xl p-8">
            <FiPackage className="text-3xl text-[#B88E2F] mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-900">No Orders Found</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              You haven&apos;t placed any orders yet.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-[#B88E2F] hover:bg-[#9f7924] text-white font-semibold text-sm px-7 py-3 rounded-xl transition-colors"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <div>
            {activeTab === "receive" &&
              (toReceiveOrders.length > 0 ? (
                toReceiveOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    products={products}
                    type="receive"
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-12">
                  No active orders in transit.
                </p>
              ))}

            {activeTab === "delivered" && (
              <>
                {deliveredOrders.length > 0 && (
                  <div className="mb-6 p-4 rounded-xl bg-[#FCF8F3] border border-[#f0e4d3] flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <FiImage className="text-[#B88E2F]" />
                        <span>#FuniroFurniture Home Gallery</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Select 4 to 8 delivered items to feature in your
                        personalized gallery on the Home page.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleGalleryMode}
                        className="bg-white border border-gray-300 hover:border-[#B88E2F] text-gray-800 text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        {selectionMode
                          ? "Cancel Selection"
                          : hasGallery
                            ? "Edit Gallery"
                            : "Curate Gallery"}
                      </button>

                      {selectionMode && (
                        <button
                          type="button"
                          onClick={handleSaveGallery}
                          disabled={isSavingGallery}
                          className="bg-[#B88E2F] hover:bg-[#9f7924] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                        >
                          {isSavingGallery
                            ? "Saving..."
                            : `Save Gallery (${selectedProducts.length}/8)`}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {deliveredOrders.length > 0 ? (
                  deliveredOrders.map((order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      products={products}
                      type="delivered"
                      selectionMode={selectionMode}
                      selectedProducts={selectedProducts}
                      toggleProduct={toggleProduct}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-12">
                    No delivered orders yet.
                  </p>
                )}
              </>
            )}

            {activeTab === "review" &&
              (reviewOrders.length > 0 ? (
                reviewOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    products={products}
                    type="review"
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-12">
                  No delivered orders waiting for review.
                </p>
              ))}
          </div>
        )}
      </div>

      <ServiceBar />
    </section>
  );
};

export default OrdersPage;
