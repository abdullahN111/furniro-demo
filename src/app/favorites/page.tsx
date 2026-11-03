"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiHeart } from "react-icons/fi";
import ProductCard from "@/app/components/cards/ProductCard";
import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import ServiceBar from "@/app/components/shared/ServiceBar";
import { ProductCardData } from "@/app/Data";
import { useFavorites } from "@/app/context/FavoritesContext";

export default function FavoritesPage() {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const { favoriteIds } = useFavorites();

  useEffect(() => {
    async function loadFavorites() {
      try {
        const res = await fetch("/api/favorites");
        if (res.ok) {
          const data = await res.json();
          setProducts(Array.isArray(data) ? data.filter(Boolean) : []);
        }
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  const visibleFavorites = products.filter((p) =>
    favoriteIds.includes(p._id)
  );

  return (
    <section className="max-w-[1440px] mx-auto">
      <SecondaryHeader routeName="Favorites" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-10 px-4 sm:px-6 lg:px-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs"
            >
              <div className="bg-gray-200 h-64 sm:h-72 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
                <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="pt-3 flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
                  <div className="h-9 bg-gray-200 rounded-lg w-28 animate-pulse" />
                </div>
              </div>
            </div>
          ))
        ) : visibleFavorites.length > 0 ? (
          visibleFavorites.map((product) => (
            <ProductCard key={product._id} card={product} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-[#F9F1E7] text-[#B88E2F] flex items-center justify-center mb-4">
              <FiHeart className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              No favorite products yet
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-6 max-w-sm">
              Tap the heart icon on any furniture piece to save it here for
              quick access later.
            </p>
            <Link
              href="/shop"
              className="px-7 py-3 rounded-md bg-[#B88E2F] text-white text-sm font-semibold hover:bg-[#9f7924] transition-colors"
            >
              Explore Shop
            </Link>
          </div>
        )}
      </div>

      <ServiceBar />
    </section>
  );
}
