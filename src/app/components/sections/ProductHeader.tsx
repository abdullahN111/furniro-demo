"use client";

import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import { useParams } from "next/navigation";
import { ProductCardData, fetchProducts } from "@/app/Data/index";
import { useState, useEffect } from "react";

const ProductHeader = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const products = await fetchProducts();
        const foundProduct = products.find(
          (item) => item._id === id || item.slug?.current === id
        );
        setProduct(foundProduct || null);
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  return (
    <nav
      aria-label="Breadcrumb"
      className="w-full px-6 sm:px-10 lg:px-16 h-20 bg-[#F9F1E7] border-b border-[#f0e4d3] flex items-center gap-2.5 sm:gap-3.5 text-sm"
    >
      <Link
        href="/"
        className="text-gray-500 hover:text-[#B88E2F] font-medium transition-colors"
      >
        Home
      </Link>
      <IoIosArrowForward className="text-gray-400 shrink-0" />
      <Link
        href="/shop"
        className="text-gray-500 hover:text-[#B88E2F] font-medium transition-colors"
      >
        Shop
      </Link>
      <IoIosArrowForward className="text-gray-400 shrink-0" />
      <div className="h-5 w-px bg-gray-300 mx-1 shrink-0" />
      {loading ? (
        <div className="h-4 w-36 bg-gray-200 animate-pulse rounded" />
      ) : product ? (
        <span className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-[360px]">
          {product.title}
        </span>
      ) : (
        <span className="text-red-500 font-medium">Product not found</span>
      )}
    </nav>
  );
};

export default ProductHeader;
