"use client";

import { useEffect, useState } from "react";
import { ProductCardData, fetchProducts } from "@/app/Data/index";
import ProductCard from "@/app/components/cards/ProductCard";

const ProductList = ({ showProducts }: { showProducts?: number }) => {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const fetched = await fetchProducts();
        setProducts(fetched);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 px-4 sm:px-6 lg:px-8">
      {isLoading
        ? Array.from({ length: showProducts || 8 }).map((_, i) => (
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
        : products
            .slice(0, showProducts)
            .map((p) => <ProductCard key={p._id} card={p} />)}
    </div>
  );
};

export default ProductList;
