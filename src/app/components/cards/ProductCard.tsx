"use client";

import { useCart } from "@/app/context/CartContext";
import { IoShareSocialOutline } from "react-icons/io5";
import { MdOutlineInventory2 } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { ProductCardData } from "@/app/Data/index";

const ProductCard = ({ card }: { card: ProductCardData }) => {
  const { addToCart } = useCart();

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
  );
};

export default ProductCard;
