"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/app/components/cards/ProductCard";
import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import ServiceBar from "@/app/components/shared/ServiceBar";
import { ProductCardData } from "@/app/Data";

export default function FavoritesPage() {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      const res = await fetch("/api/favorites");
      const data = await res.json();

      setProducts(data);
      setLoading(false);
    }

    loadFavorites();
  }, []);

  return (
    <section className="max-w-[1440px] mx-auto">
      <SecondaryHeader routeName="Favorites" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 px-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 h-64 rounded-lg animate-pulse"
            />
          ))
        ) : products.length ? (
          products.map((product) => (
            <ProductCard key={product._id} card={product} />
          ))
        ) : (
          <p className="col-span-full text-center">No favorite products yet.</p>
        )}
      </div>

      <ServiceBar />
    </section>
  );
}
