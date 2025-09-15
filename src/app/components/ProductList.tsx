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
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (error) {
    return <p className="text-center text-red-500 py-10">{error}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 px-4">
      {isLoading
        ? Array.from({ length: showProducts || 8 }).map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 animate-pulse rounded-lg"></div>
          ))
        : products
            .slice(0, showProducts)
            .map((p) => <ProductCard key={p._id} card={p} />)}
    </div>
  );
};

export default ProductList;
