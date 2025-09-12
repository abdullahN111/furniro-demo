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
        // console.log("Fetched Products:", fetchedProducts);
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
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center sm:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 sm:gap-8 my-6 mx-4 lg:mx-6">
      {isLoading
        ? Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="relative flex flex-col w-[250px] sm:w-auto h-[300px] bg-gray-100 rounded-sm shadow-md overflow-hidden sm:mx-10 md:mx-2 lg:mx-0 animate-pulse"
            >
              <div className="relative w-full h-0 pb-[75%] bg-gray-300"></div>
              <div className="flex flex-col gap-2 p-4">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2">
                  <span className="text-gray-600 text-xs">
                    Loading product...
                  </span>
                </div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
          ))
        : products.slice(0, showProducts).map((card) => (
            <div
              key={card._id}
              className="relative flex flex-col w-[240px] sm:w-auto h-[350px] lg:h-[360px] xl:h-[380px] bg-[#F4F5F7] rounded-sm shadow-md overflow-hidden sm:mx-10 md:mx-2 lg:mx-0 transition-transform duration-300"
            >
              <div className="relative w-full h-0 pb-[75%] group cursor-pointer">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  // objectFit="cover"
                  sizes="100vw"
                />
                {card.dicountPercentage && (
                  <div
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-sm text-white rounded-full"
                    style={{
                      backgroundColor: card.dicountPercentage.color,
                    }}
                  >
                    {card.dicountPercentage.text}
                  </div>
                )}

                <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center gap-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    className="text-[#B88E2F] bg-white text-sm font-semibold py-2 px-8 rounded-sm hover:bg-[#96741E] hover:text-white transition duration-300"
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
                  <div className="flex gap-4">
                    <button className="text-white flex items-center gap-[2px] hover:text-[#B88E2F] transition duration-300 text-sm">
                      <span>
                        <IoShareSocialOutline />
                      </span>{" "}
                      Share
                    </button>
                    <button
                      className={`${
                        card.inventoryInStock && card.inventoryInStock > 0
                          ? "text-white"
                          : "text-red-600 hover:text-red-500"
                      } flex items-center gap-[2px] hover:text-[#B88E2F] transition duration-300 text-sm`}
                    >
                      <span>
                        <MdOutlineInventory2 />
                      </span>{" "}
                      Stock
                    </button>
                    <button className="text-white flex items-center gap-[2px] hover:text-[#B88E2F] transition duration-300 text-sm">
                      <span>
                        <FaRegHeart />
                      </span>{" "}
                      Like
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 p-4">
                <Link href={`/add-to-cart/${card.slug.current}`}>
                  <h4 className="text-2xl font-semibold text-[#3A3A3A] hover:underline cursor-pointer">
                    {card.title}
                  </h4>
                </Link>
                <p className="text-base text-[#898989]">{card.featured}</p>
                <h5 className="text-xl font-semibold text-[#3A3A3A]">
                  $ {card.price}.00{" "}
                  {card.oldPrice && (
                    <span className="text-base text-[#B0B0B0] line-through font-normal">
                      $ {card.oldPrice}
                    </span>
                  )}
                </h5>
              </div>
            </div>
          ))}
    </div>
  );
};

export default ProductCard;
