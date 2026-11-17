"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ProductCardData, fetchProducts } from "@/app/Data/index";
import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/app/context/CartContext";
import { useFavorites } from "@/app/context/FavoritesContext";
import { useToast } from "@/app/context/ToastContext";
import ProductCard from "@/app/components/cards/ProductCard";
import ProductAiInsights from "@ai/components/ProductAiInsights";
import { IoShareSocialOutline } from "react-icons/io5";
import {
  FaRegHeart,
  FaHeart,
  FaStar,
  FaRegStar,
  FaCheckCircle,
} from "react-icons/fa";
import {
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiMaximize2,
  FiX,
  FiMessageSquare,
  FiSliders,
} from "react-icons/fi";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface EligibleOrder {
  orderId: string;
  userName: string;
}

const StarDisplay = ({
  rating,
  size = "text-base",
}: {
  rating: number;
  size?: string;
}) => (
  <span className={`${size} text-[#FFC700] inline-flex items-center gap-0.5`}>
    {[1, 2, 3, 4, 5].map((n) =>
      n <= Math.round(rating) ? <FaStar key={n} /> : <FaRegStar key={n} />
    )}
  </span>
);

const GALLERY_VIEWS = [
  {
    label: "Studio View",
    thumbClass: "object-cover scale-100",
    mainClass: "object-cover scale-100",
  },
  {
    label: "Texture & Detail",
    thumbClass: "object-cover scale-125 object-center",
    mainClass: "object-cover scale-125 object-center",
  },
  {
    label: "Upper Profile",
    thumbClass: "object-cover scale-115 object-top",
    mainClass: "object-cover scale-115 object-top",
  },
  {
    label: "Warm Ambience",
    thumbClass: "object-cover scale-110 object-bottom sepia-[0.12] contrast-105",
    mainClass: "object-cover scale-110 object-bottom sepia-[0.12] contrast-105",
  },
];

const ProductDetail = () => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite, loadingIds } = useFavorites();
  const { showToast } = useToast();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [products, setProducts] = useState<ProductCardData[] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeView, setActiveView] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">("overview");

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [eligibleOrder, setEligibleOrder] = useState<EligibleOrder | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Review Filtering & Sorting
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [reviewSort, setReviewSort] = useState<"newest" | "highest" | "lowest">(
    "newest"
  );

  // Inline Review Form State
  const [draftRating, setDraftRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [draftComment, setDraftComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
    }
    loadProducts();
  }, []);

  const product = useMemo(
    () =>
      products?.find(
        (item) => item._id === id || item.slug?.current === id
      ) || null,
    [products, id]
  );

  useEffect(() => {
    if (!product) return;

    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const res = await fetch(`/api/reviews?productId=${product._id}`);
        const data = await res.json();
        if (res.ok) {
          setReviews(data.reviews ?? []);
          setAverageRating(data.average ?? 0);
          setReviewCount(data.count ?? 0);
          setEligibleOrder(data.eligibleOrder ?? null);
          setHasReviewed(Boolean(data.hasReviewed));
        }
      } catch (error) {
        console.error("Failed to load reviews:", error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [product]);

  const ratingBreakdown = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[rounded] = (counts[rounded] || 0) + 1;
    });
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star],
      percent: reviewCount > 0 ? Math.round((counts[star] / reviewCount) * 100) : 0,
    }));
  }, [reviews, reviewCount]);

  const filteredReviews = useMemo(() => {
    let list = [...reviews];
    if (starFilter !== null) {
      list = list.filter((r) => Math.round(r.rating) === starFilter);
    }
    if (reviewSort === "highest") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (reviewSort === "lowest") {
      list.sort((a, b) => a.rating - b.rating);
    } else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return list;
  }, [reviews, starFilter, reviewSort]);

  const relatedProducts = useMemo(() => {
    if (!products || !product) return [];
    const currentTags = product.tags
      .toLowerCase()
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const scored = products
      .filter((p) => p._id !== product._id)
      .map((p) => {
        const pTags = p.tags.toLowerCase();
        const matches = currentTags.filter((t) => pTags.includes(t)).length;
        return { item: p, score: matches };
      })
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 4).map((s) => s.item);
  }, [products, product]);

  if (!products) {
    return (
      <div className="max-w-[1440px] mx-auto py-12 px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="h-[440px] bg-gray-200 animate-pulse rounded-2xl" />
          <div className="space-y-5">
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
            <div className="h-10 w-3/4 bg-gray-200 animate-pulse rounded" />
            <div className="h-8 w-40 bg-gray-200 animate-pulse rounded" />
            <div className="h-28 w-full bg-gray-200 animate-pulse rounded" />
            <div className="h-12 w-64 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Product Not Found
        </h2>
        <p className="text-gray-500 mb-6">
          The furniture piece you are looking for may have been moved or is no
          longer available.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-[#B88E2F] text-white font-semibold px-7 py-3 rounded-md hover:bg-[#9f7924] transition-colors"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const favorited = isFavorite(product._id);
  const loadingFavorite = Boolean(loadingIds[product._id]);
  const inStock = product.inventoryInStock > 0;
  const tagList = product.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const handleIncrement = () => {
    if (quantity < product.inventoryInStock) {
      setQuantity((prev) => prev + 1);
    } else {
      showToast({
        message: `Maximum available stock (${product.inventoryInStock}) reached`,
        type: "info",
      });
    }
  };

  const handleDecrement = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart({
      id: product._id,
      name: product.title,
      price: product.price,
      quantity,
      image: product.image,
    });
    showToast({
      message: `Added ${quantity} × "${product.title}" to cart`,
      type: "success",
      actionLabel: "View Cart",
      actionHref: "/cart",
    });
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    addToCart({
      id: product._id,
      name: product.title,
      price: product.price,
      quantity,
      image: product.image,
    });
    router.push("/checkout");
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${product.title} — Furniro`,
          text: product.description.slice(0, 120),
          url,
        });
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast({
        message: "Product link copied to clipboard!",
        type: "info",
      });
    } catch {
      showToast({
        message: "Could not copy link",
        type: "error",
      });
    }
  };

  const handleSubmitInlineReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligibleOrder || submittingReview) return;

    if (draftRating < 1 || draftRating > 5) {
      showToast({ message: "Please select a star rating", type: "error" });
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: eligibleOrder.orderId,
          productId: product._id,
          userName: eligibleOrder.userName,
          rating: draftRating,
          comment: draftComment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast({
          message: data.error || "Could not submit review",
          type: "error",
        });
        return;
      }

      const newReview: Review = {
        _id: data.reviewId || `${Date.now()}`,
        userName: eligibleOrder.userName,
        rating: draftRating,
        comment: draftComment.trim(),
        createdAt: new Date().toISOString(),
      };

      const nextReviews = [newReview, ...reviews];
      const nextCount = nextReviews.length;
      const nextAvg =
        nextReviews.reduce((s, r) => s + r.rating, 0) / nextCount;

      setReviews(nextReviews);
      setReviewCount(nextCount);
      setAverageRating(Math.round(nextAvg * 10) / 10);
      setEligibleOrder(null);
      setHasReviewed(true);
      setDraftComment("");

      showToast({
        message: "Thank you! Your verified review has been published.",
        type: "success",
      });
    } catch {
      showToast({
        message: "Network error while submitting review",
        type: "error",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden mx-auto py-8 sm:py-14 px-4 sm:px-10 lg:px-16">
      {/* Top Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14">
        {/* Left: Interactive Image Gallery (7 cols on lg) */}
        <div className="lg:col-span-7 min-w-0 flex flex-col-reverse sm:flex-row gap-4">
          {/* Angle / Crop Thumbnails */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
            {GALLERY_VIEWS.map((view, idx) => (
              <button
                key={view.label}
                type="button"
                onClick={() => setActiveView(idx)}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#F9F1E7] shrink-0 border-2 transition-all ${
                  activeView === idx
                    ? "border-[#B88E2F] shadow-md scale-[1.02]"
                    : "border-transparent opacity-75 hover:opacity-100"
                }`}
                title={view.label}
              >
                <Image
                  src={product.image}
                  alt={`${product.title} — ${view.label}`}
                  fill
                  className={`transition-transform duration-300 ${view.thumbClass}`}
                  sizes="96px"
                />
              </button>
            ))}
          </div>

          {/* Main Image Stage */}
          <div className="relative flex-1 bg-[#F9F1E7] rounded-2xl h-[360px] sm:h-[480px] lg:h-[520px] overflow-hidden group shadow-xs border border-[#f0e4d3]">
            <Image
              src={product.image}
              alt={product.title}
              fill
              priority
              className={`transition-all duration-500 ${GALLERY_VIEWS[activeView].mainClass}`}
              sizes="(max-width: 1024px) 100vw, 60vw"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {product.dicountPercentage && (
                <span className="px-3 py-1 text-xs font-bold text-white bg-[#E97171] rounded-full shadow-xs">
                  {product.dicountPercentage.text}
                </span>
              )}
              {product.isNew && (
                <span className="px-3 py-1 text-xs font-bold text-white bg-[#2EC1AC] rounded-full shadow-xs">
                  New Arrival
                </span>
              )}
            </div>

            {/* Active View Pill & Lightbox Button */}
            <div className="absolute bottom-4 inset-x-4 flex items-center justify-between z-10">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-xs text-gray-700 shadow-xs">
                {GALLERY_VIEWS[activeView].label}
              </span>
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label="Expand image"
                className="p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-800 hover:text-[#B88E2F] shadow-md transition-colors"
              >
                <FiMaximize2 className="text-base" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Product Info & Actions (5 cols on lg) */}
        <div className="lg:col-span-5 min-w-0 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Category & Stock Pill */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-widest text-[#B88E2F] bg-[#F9F1E7] px-3 py-1 rounded-full">
                {product.featured || tagList[0] || "Signature Collection"}
              </span>
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {product.inventoryInStock} in stock & ready to ship
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              {product.title}
            </h1>

            {/* Rating Summary Link */}
            <div className="flex items-center gap-3">
              <StarDisplay rating={averageRating} />
              <button
                type="button"
                onClick={() => {
                  setActiveTab("reviews");
                  document
                    .getElementById("product-tabs")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-sm font-medium text-gray-600 hover:text-[#B88E2F] transition-colors underline-offset-4 hover:underline"
              >
                {loadingReviews
                  ? "Loading reviews..."
                  : reviewCount > 0
                    ? `${averageRating.toFixed(1)} (${reviewCount} verified review${reviewCount === 1 ? "" : "s"})`
                    : "No reviews yet — be the first"}
              </button>
            </div>

            {/* Price Block */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl font-bold text-[#B88E2F]">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.oldPrice && (
                <span className="text-lg text-gray-400 line-through">
                  ${Number(product.oldPrice).toFixed(2)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
              {product.description.length > 340
                ? `${product.description.slice(0, 340)}...`
                : product.description}
            </p>

            {/* Clickable Tags */}
            {tagList.length > 0 && (
              <div className="pt-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Style Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {tagList.map((tag) => (
                    <Link
                      key={tag}
                      href={`/shop?category=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 text-xs font-medium text-gray-700 bg-[#F9F1E7] hover:bg-[#B88E2F] hover:text-white rounded-full transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart + Buy Now */}
            <div className="pt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Quantity Counter */}
                <div className="inline-flex items-center border border-gray-300 rounded-xl bg-white h-12 px-2">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={!inStock || quantity <= 1}
                    aria-label="Decrease quantity"
                    className="w-9 h-9 rounded-lg text-lg font-semibold text-gray-700 hover:bg-[#F9F1E7] hover:text-[#B88E2F] disabled:opacity-40 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-base font-bold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={!inStock}
                    aria-label="Increase quantity"
                    className="w-9 h-9 rounded-lg text-lg font-semibold text-gray-700 hover:bg-[#F9F1E7] hover:text-[#B88E2F] disabled:opacity-40 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 min-w-[160px] h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#B88E2F] hover:bg-[#9f7924] text-white font-semibold text-sm sm:text-base shadow-sm transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <FiShoppingBag className="text-lg" />
                  <span>{inStock ? "Add to Cart" : "Out of Stock"}</span>
                </button>

                {/* Buy Now Button */}
                {inStock && (
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="h-12 px-6 rounded-xl border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold text-sm sm:text-base transition-colors"
                  >
                    Buy Now
                  </button>
                )}
              </div>

              {/* Secondary Actions: Favorite & Share */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => toggleFavorite(product._id, product.title)}
                  disabled={loadingFavorite}
                  className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
                    favorited
                      ? "border-red-200 bg-red-50 text-red-600"
                      : "border-gray-200 text-gray-700 hover:border-[#B88E2F] hover:text-[#B88E2F]"
                  }`}
                >
                  {favorited ? (
                    <FaHeart className="text-red-500 text-base" />
                  ) : (
                    <FaRegHeart className="text-gray-600 text-base" />
                  )}
                  <span>
                    {favorited ? "Saved in Favorites" : "Add to Wishlist"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:border-[#B88E2F] hover:text-[#B88E2F] transition-colors"
                >
                  <IoShareSocialOutline className="text-base" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Trust & Delivery Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FCF8F3]">
                <FiTruck className="text-[#B88E2F] text-xl shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Free Shipping
                  </p>
                  <p className="text-[11px] text-gray-500">
                    White-glove delivery
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FCF8F3]">
                <FiShield className="text-[#B88E2F] text-xl shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    2-Year Warranty
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Craftsmanship guarantee
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FCF8F3]">
                <FiRefreshCw className="text-[#B88E2F] text-xl shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    30-Day Returns
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Hassle-free exchange
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Overview & Specifications vs Customer Reviews */}
      <div id="product-tabs" className="mt-16 pt-10 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 sm:gap-12 border-b border-gray-200 mb-10">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`pb-4 text-base sm:text-xl font-bold transition-colors relative ${
              activeTab === "overview"
                ? "text-[#B88E2F] after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-[#B88E2F] after:rounded-full"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Overview & Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 text-base sm:text-xl font-bold transition-colors relative flex items-center gap-2 ${
              activeTab === "reviews"
                ? "text-[#B88E2F] after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-[#B88E2F] after:rounded-full"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <span>Customer Reviews</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F9F1E7] text-[#B88E2F]">
              {reviewCount}
            </span>
          </button>
        </div>

        {activeTab === "overview" ? (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-7 space-y-4">
              <h3 className="text-xl font-bold text-gray-900">
                Crafted for Modern Living
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
            <div className="md:col-span-5 bg-[#FCF8F3] rounded-2xl p-6 border border-[#f0e4d3]">
              <h4 className="text-base font-bold text-gray-900 mb-4">
                Product Specifications
              </h4>
              <dl className="divide-y divide-[#ece0cf] text-sm">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-gray-500">Collection</dt>
                  <dd className="font-semibold text-gray-800">
                    {product.featured || "Furniro Signature"}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-gray-500">Availability</dt>
                  <dd className="font-semibold text-gray-800">
                    {product.inventoryInStock} units in stock
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-gray-500">Materials</dt>
                  <dd className="font-semibold text-gray-800">
                    Kiln-dried hardwood & premium finish
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-gray-500">Care</dt>
                  <dd className="font-semibold text-gray-800">
                    Wipe clean with a soft, dry cloth
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ) : (
          /* Upgraded Customer Reviews & AI Insights Section */
          <div>
            <ProductAiInsights
              productId={product._id}
              productTitle={product.title}
              reviewCount={reviewCount}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left Column: Rating Breakdown & Write a Review Card */}
            <div className="lg:col-span-4 min-w-0 space-y-6">
              {/* Rating Summary Box */}
              <div className="bg-[#FCF8F3] border border-[#f0e4d3] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Customer Rating
                </h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-xs border border-[#f0e4d3] flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">
                      {reviewCount > 0 ? averageRating.toFixed(1) : "—"}
                    </span>
                    <span className="text-[11px] text-gray-400">out of 5</span>
                  </div>
                  <div>
                    <StarDisplay rating={averageRating} size="text-lg" />
                    <p className="text-sm font-medium text-gray-700 mt-1">
                      Based on {reviewCount} verified review
                      {reviewCount === 1 ? "" : "s"}
                    </p>
                    <p className="text-xs text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                      <FaCheckCircle className="text-emerald-600" /> 100%
                      Verified Buyers
                    </p>
                  </div>
                </div>

                {/* 5-to-1 Star Progress Bars */}
                <div className="space-y-2.5">
                  {ratingBreakdown.map((row) => {
                    const isSelected = starFilter === row.star;
                    return (
                      <button
                        key={row.star}
                        type="button"
                        onClick={() =>
                          setStarFilter(isSelected ? null : row.star)
                        }
                        className={`w-full flex items-center gap-3 text-xs font-medium py-1 px-2 rounded-lg transition-colors ${
                          isSelected
                            ? "bg-[#F9F1E7] ring-1 ring-[#B88E2F]"
                            : "hover:bg-white/60"
                        }`}
                      >
                        <span className="w-11 text-left font-semibold text-gray-700 flex items-center gap-1">
                          {row.star} <FaStar className="text-[#FFC700]" />
                        </span>
                        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#B88E2F] rounded-full transition-all duration-500"
                            style={{ width: `${row.percent}%` }}
                          />
                        </div>
                        <span className="w-9 text-right text-gray-500">
                          {row.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {starFilter !== null && (
                  <button
                    type="button"
                    onClick={() => setStarFilter(null)}
                    className="mt-4 w-full text-xs font-semibold text-[#B88E2F] hover:underline text-center"
                  >
                    Clear {starFilter}-star filter
                  </button>
                )}
              </div>

              {/* Inline Review Form or Verified Purchase Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs">
                {eligibleOrder ? (
                  <form onSubmit={handleSubmitInlineReview} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-gray-900">
                        Write a Verified Review
                      </h4>
                      <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full">
                        Order #{eligibleOrder.orderId.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Sharing your experience as{" "}
                      <strong className="text-gray-700">
                        {eligibleOrder.userName}
                      </strong>
                    </p>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Your Rating
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setDraftRating(star)}
                            className="text-2xl focus:outline-none transition-transform hover:scale-110"
                          >
                            {star <= (hoverRating || draftRating) ? (
                              <FaStar className="text-[#FFC700]" />
                            ) : (
                              <FaRegStar className="text-gray-300" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Your Review
                      </label>
                      <textarea
                        rows={3}
                        value={draftComment}
                        onChange={(e) => setDraftComment(e.target.value)}
                        placeholder="What did you love about the quality, comfort, or finish?"
                        className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-[#B88E2F] transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#B88E2F] hover:bg-[#9f7924] text-white text-sm font-semibold transition-colors disabled:opacity-60"
                    >
                      {submittingReview
                        ? "Publishing Review..."
                        : "Publish Verified Review"}
                    </button>
                  </form>
                ) : hasReviewed ? (
                  <div className="text-center py-3 space-y-2">
                    <FaCheckCircle className="text-emerald-600 text-2xl mx-auto" />
                    <h4 className="text-sm font-bold text-gray-900">
                      Thank you for reviewing this piece!
                    </h4>
                    <p className="text-xs text-gray-500">
                      Your verified review is live and helping other shoppers.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                      <FiMessageSquare className="text-[#B88E2F] text-lg" />
                      <span>Own this furniture piece?</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      To keep our reviews 100% authentic, reviews can be posted
                      once your order has been marked as{" "}
                      <strong className="text-gray-700">Delivered</strong>.
                    </p>
                    <Link
                      href="/orders"
                      className="inline-block w-full text-center py-2.5 px-4 rounded-xl border border-[#B88E2F] text-[#B88E2F] hover:bg-[#B88E2F] hover:text-white text-xs font-semibold transition-colors"
                    >
                      Go to My Orders to Review
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Filter Bar & Review Feed */}
            <div className="lg:col-span-8 min-w-0 space-y-6">
              {/* Filter & Sort Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 mr-1">
                    <FiSliders className="text-[#B88E2F]" /> Filter:
                  </span>
                  <button
                    type="button"
                    onClick={() => setStarFilter(null)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      starFilter === null
                        ? "bg-[#B88E2F] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-[#F9F1E7]"
                    }`}
                  >
                    All ({reviewCount})
                  </button>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setStarFilter(starFilter === star ? null : star)
                      }
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        starFilter === star
                          ? "bg-[#B88E2F] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-[#F9F1E7]"
                      }`}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-500">
                    Sort by:
                  </label>
                  <select
                    value={reviewSort}
                    onChange={(e) =>
                      setReviewSort(
                        e.target.value as "newest" | "highest" | "lowest"
                      )
                    }
                    className="text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#B88E2F]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                  </select>
                </div>
              </div>

              {/* Reviews List */}
              {loadingReviews ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-32 rounded-2xl bg-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="bg-[#FCF8F3] border border-[#f0e4d3] rounded-2xl p-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-white text-[#B88E2F] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <FiMessageSquare className="text-xl" />
                  </div>
                  <h4 className="text-base font-bold text-gray-800">
                    {starFilter !== null
                      ? `No ${starFilter}-star reviews yet`
                      : "No customer reviews yet"}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
                    {starFilter !== null
                      ? "Try clearing the star filter to view all customer feedback."
                      : "Once customers receive their delivered orders, their verified ratings and feedback will appear here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((review) => {
                    const name = review.userName || "Verified Customer";
                    const initials = name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <article
                        key={review._id}
                        className="bg-white border border-gray-100 hover:border-[#f0e4d3] rounded-2xl p-5 sm:p-6 shadow-2xs transition-all"
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-full bg-[#F9F1E7] text-[#B88E2F] font-bold text-sm flex items-center justify-center shrink-0">
                              {initials || "FC"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-gray-900">
                                  {name}
                                </h4>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  <FaCheckCircle className="text-[10px]" />
                                  Verified Purchase
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <StarDisplay
                                  rating={review.rating}
                                  size="text-xs"
                                />
                                <span className="text-xs font-semibold text-gray-700">
                                  {review.rating}.0
                                </span>
                              </div>
                            </div>
                          </div>

                          <time className="text-xs text-gray-400 font-medium">
                            {new Date(review.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </time>
                        </div>

                        {review.comment ? (
                          <p className="text-sm text-gray-700 mt-4 leading-relaxed pl-0 sm:pl-14">
                            &ldquo;{review.comment}&rdquo;
                          </p>
                        ) : (
                          <p className="text-xs italic text-gray-400 mt-3 pl-0 sm:pl-14">
                            Rated {review.rating} out of 5 stars without written
                            comment.
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-gray-200">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B88E2F]">
              Complete the Room
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              Related Products
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item._id} card={item} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/shop"
              className="inline-block border-2 border-[#B88E2F] text-[#B88E2F] hover:bg-[#B88E2F] hover:text-white font-semibold text-sm sm:text-base px-10 py-3 rounded-md transition-colors"
            >
              Show More
            </Link>
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[2500] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full aspect-square sm:aspect-[4/3] bg-[#F9F1E7] rounded-2xl overflow-hidden shadow-2xl"
          >
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-contain"
              sizes="90vw"
            />
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close full-screen image"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
