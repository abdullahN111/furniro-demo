"use client";

import { ProductCardData, fetchProducts } from "@/app/Data/index";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";

import { IoShareSocialOutline } from "react-icons/io5";
import { MdOutlineInventory2 } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import Link from "next/link";
import { useEffect, useState } from "react";

const ProductCard = ({ showProducts }: { showProducts?: number }) => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
        setError(null);
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
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 px-4">
      {isLoading
        ? Array.from({ length: showProducts || 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
            >
              <div className="w-full h-64 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))
        : products.slice(0, showProducts).map((card) => (
            <div
              key={card._id}
              className="group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                
                {card.dicountPercentage && (
                  <div className="absolute top-3 right-3 w-12 h-12 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
                    {card.dicountPercentage.text}
                  </div>
                )}

                <div className="absolute inset-0 bg-black bg-opacity-0 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:bg-opacity-70 group-hover:opacity-100 transition-all duration-300">
                  <button
                    className="text-[#B88E2F] bg-white text-sm font-semibold py-3 px-8 rounded hover:bg-[#B88E2F] hover:text-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
                    onClick={() => {
                      if (card.inventoryInStock > 0) {
                        addToCart({
                          id: card._id,
                          name: card.title,
                          price: card.price,
                          quantity: 1,
                          image: card.image,
                        });
                      }
                    }}
                  >
                    Add to Cart
                  </button>
                  <div className="flex gap-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100">
                    <button className="text-white flex flex-col items-center hover:text-[#B88E2F] transition-colors duration-300 text-xs">
                      <IoShareSocialOutline className="text-lg mb-1" />
                      Share
                    </button>
                    <button
                      className={`flex flex-col items-center transition-colors duration-300 text-xs ${
                        card.inventoryInStock && card.inventoryInStock > 0
                          ? "text-white hover:text-[#B88E2F]"
                          : "text-red-400"
                      }`}
                    >
                      <MdOutlineInventory2 className="text-lg mb-1" />
                      Stock
                    </button>
                    <button className="text-white flex flex-col items-center hover:text-[#B88E2F] transition-colors duration-300 text-xs">
                      <FaRegHeart className="text-lg mb-1" />
                      Like
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <Link href={`/add-to-cart/${card.slug.current}`}>
                  <h4 className="text-lg font-semibold text-gray-800 hover:text-[#B88E2F] transition-colors duration-300 line-clamp-1 mb-2">
                    {card.title}
                  </h4>
                </Link>
                <p className="text-sm text-gray-500 mb-3 line-clamp-1">{card.featured}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-gray-800">
                      ${card.price}
                    </span>
                    {card.oldPrice && (
                      <span className="text-sm text-gray-400 line-through ml-2">
                        ${card.oldPrice}
                      </span>
                    )}
                  </div>
                  {card.inventoryInStock > 0 ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
    </div>
  );
};

export default ProductCard;