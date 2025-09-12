"use client";

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

  if (loading) {
    return (
      <div className="w-full h-24 bg-[#F9F1E7] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-8 sm:px-12 md:px-16 lg:px-20 h-24 bg-[#F9F1E7]  flex items-center gap-3 md:gap-4">
      <p className="text-sm md:text-base text-[#9F9F9F]">Home</p>
      <IoIosArrowForward className="text-[#9F9F9F]" />
      <p className="text-sm md:text-base text-[#9F9F9F]">Shop</p>
      <IoIosArrowForward className="text-[#9F9F9F]" />
      <div className="h-5 w-px bg-[#9F9F9F]" />
      {product ? (
        <p className="text-sm md:text-base text-black truncate max-w-[200px] md:max-w-[300px]">
          {product.title}
        </p>
      ) : (
        <p className="text-sm md:text-base text-red-500">Product not found</p>
      )}
    </div>
  );
};

export default ProductHeader;
