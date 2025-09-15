"use client";

import { useEffect, useState, useMemo } from "react";

import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import ShopFilter from "@/app/components/sections/ShopFilter";
import ShopButtons from "@/app/components/sections/ShopButtons";
import ProductCard from "@/app/components/cards/ProductCard";
import ServiceBar from "@/app/components/shared/ServiceBar";

import { ProductCardData, fetchProducts } from "@/app/Data";

const Page = () => {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case "price-low-high":
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-high-low":
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "title-a-z":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-z-a":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }
    return sorted;
  }, [products, sortBy]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  return (
    <section className="max-w-[1440px] mx-auto">
      <SecondaryHeader routeName="Shop" />

      <ShopFilter
        productsPerPage={productsPerPage}
        setProductsPerPage={setProductsPerPage}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 px-4">
        {loading ? (
          Array.from({ length: productsPerPage }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 h-64 animate-pulse rounded-lg"
            ></div>
          ))
        ) : error ? (
          <p className="text-center text-red-500 col-span-full">{error}</p>
        ) : currentProducts.length > 0 ? (
          currentProducts.map((p) => <ProductCard key={p._id} card={p} />)
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            No products found
          </p>
        )}
      </div>

      <ShopButtons
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        productsPerPage={productsPerPage}
      />

      <ServiceBar />
    </section>
  );
};

export default Page;
