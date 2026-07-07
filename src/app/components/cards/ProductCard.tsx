"use client";

import { useCart } from "@/app/context/CartContext";
import { IoShareSocialOutline } from "react-icons/io5";
import { MdOutlineInventory2 } from "react-icons/md";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { ProductCardData } from "@/app/Data/index";
import { useState } from "react";

const ProductCard = ({ card }: { card: ProductCardData }) => {
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  const handleFavorite = async () => {
    console.log("clicked");
    if (loadingFavorite) return;

    try {
      setLoadingFavorite(true);

      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: card._id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      console.log("API returned:", data.isFavorite);
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFavorite(false);
    }
  };

  return (
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
          <div className="flex gap-5 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100">

            <button className="relative group/icon text-white hover:text-[#B88E2F] transition-colors">
              <IoShareSocialOutline className="text-xl" />

              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap
      rounded-md bg-gray-900 px-3 py-1 text-xs text-white
      opacity-0 group-hover/icon:opacity-100 transition duration-200 pointer-events-none">
                Share Product
              </span>
            </button>

            <Link
              href={`/add-to-cart/${card.slug.current}`}
              className={`relative group/icon transition-colors ${card.inventoryInStock > 0
                ? "text-white hover:text-[#B88E2F]"
                : "text-red-400"
                }`}
            >
              <MdOutlineInventory2 className="text-xl" />

              <span
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap
      rounded-md px-3 py-1 text-xs text-white
      opacity-0 group-hover/icon:opacity-100 transition duration-200 pointer-events-none
      ${card.inventoryInStock > 0
                    ? "bg-gray-900"
                    : "bg-red-600"
                  }`}
              >
                {card.inventoryInStock > 0
                  ? `${card.inventoryInStock} in stock`
                  : "Out of Stock"}
              </span>
            </Link>

            <button
              onClick={handleFavorite}
              disabled={loadingFavorite}
              className="relative group/icon transition-colors"
            >
              {isFavorite ? (
                <FaHeart className="text-xl text-[#B88E2F]" />
              ) : (
                <FaRegHeart className="text-xl text-white group-hover/icon:text-[#B88E2F]" />
              )}

              <span
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap
    rounded-md bg-gray-900 px-3 py-1 text-xs text-white
    opacity-0 group-hover/icon:opacity-100 transition duration-200 pointer-events-none"
              >
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </span>
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
  );
};

export default ProductCard;
