"use client";

import { useCart } from "@/app/context/CartContext";
import { useFavorites } from "@/app/context/FavoritesContext";
import { useToast } from "@/app/context/ToastContext";
import { IoShareSocialOutline } from "react-icons/io5";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FiShoppingBag, FiEye } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { ProductCardData } from "@/app/Data/index";

const ProductCard = ({ card }: { card: ProductCardData }) => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite, loadingIds } = useFavorites();
  const { showToast } = useToast();

  const favorited = isFavorite(card._id);
  const loadingFavorite = Boolean(loadingIds[card._id]);
  const inStock = card.inventoryInStock > 0;
  const productUrl = `/product/${card.slug?.current || card._id}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) {
      showToast({
        message: `"${card.title}" is currently out of stock`,
        type: "error",
      });
      return;
    }

    addToCart({
      id: card._id,
      name: card.title,
      price: card.price,
      quantity: 1,
      image: card.image,
    });

    showToast({
      message: `Added "${card.title}" to cart`,
      type: "success",
      actionLabel: "View Cart",
      actionHref: "/cart",
    });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const fullUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${productUrl}`
        : productUrl;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${card.title} — Furniro`,
          text: card.featured || card.description,
          url: fullUrl,
        });
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      showToast({
        message: "Product link copied to clipboard!",
        type: "info",
      });
    } catch {
      showToast({
        message: "Unable to copy product link",
        type: "error",
      });
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(card._id, card.title);
  };

  return (
    <article className="group bg-white rounded-xl border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image & Overlays */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gray-100">
        <Link
          href={productUrl}
          aria-label={`View details for ${card.title}`}
          className="block w-full h-full"
        >
          <Image
            src={card.image}
            alt={card.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </Link>

        {/* Top-Left Badges (Discount & New) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {card.dicountPercentage && (
            <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold text-white bg-[#E97171] rounded-full shadow-xs">
              {card.dicountPercentage.text}
            </span>
          )}
          {card.isNew && (
            <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold text-white bg-[#2EC1AC] rounded-full shadow-xs">
              New
            </span>
          )}
        </div>

        {/* Top-Right Floating Quick Actions (Always accessible on Mobile & Desktop) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={loadingFavorite}
            aria-label={
              favorited ? "Remove from Favorites" : "Add to Favorites"
            }
            title={favorited ? "Remove from Favorites" : "Add to Favorites"}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
              favorited
                ? "bg-white text-red-500 scale-105"
                : "bg-white/90 text-gray-700 hover:bg-white hover:text-red-500"
            }`}
          >
            {favorited ? (
              <FaHeart className="text-base" />
            ) : (
              <FaRegHeart className="text-base" />
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label={`Share ${card.title}`}
            title="Share Product"
            className="w-9 h-9 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-[#B88E2F] flex items-center justify-center shadow-md transition-all duration-200"
          >
            <IoShareSocialOutline className="text-base" />
          </button>

          <Link
            href={productUrl}
            aria-label={`Quick view ${card.title}`}
            title="View Product Details"
            className="w-9 h-9 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-[#B88E2F] flex items-center justify-center shadow-md transition-all duration-200 lg:opacity-0 lg:group-hover:opacity-100"
          >
            <FiEye className="text-base" />
          </Link>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider truncate">
              {card.featured || card.tags || "Furniture"}
            </p>
            {inStock ? (
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">
                {card.inventoryInStock <= 5
                  ? `Only ${card.inventoryInStock} left`
                  : "In Stock"}
              </span>
            ) : (
              <span className="text-[11px] font-semibold bg-red-50 text-red-600 px-2 py-0.5 rounded-full shrink-0">
                Out of Stock
              </span>
            )}
          </div>

          <Link href={productUrl}>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#B88E2F] transition-colors duration-200 line-clamp-1 mb-2">
              {card.title}
            </h3>
          </Link>
        </div>

        <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">
              ${Number(card.price).toLocaleString()}
            </span>
            {card.oldPrice && (
              <span className="text-xs text-gray-400 line-through">
                ${Number(card.oldPrice).toLocaleString()}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
              inStock
                ? "bg-[#F9F1E7] text-[#B88E2F] hover:bg-[#B88E2F] hover:text-white shadow-2xs"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FiShoppingBag className="text-sm shrink-0" />
            <span>{inStock ? "Add to Cart" : "Sold Out"}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
