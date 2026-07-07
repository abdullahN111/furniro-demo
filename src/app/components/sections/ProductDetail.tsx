"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { ProductCardData, fetchProducts } from "@/app/Data/index";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";
import { IoShareSocialOutline } from "react-icons/io5";
import { MdOutlineInventory2 } from "react-icons/md";
import { FaRegHeart, FaHeart } from "react-icons/fa";

const ProductDetail = () => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<ProductCardData[] | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);


  useEffect(() => {
    async function loadProducts() {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
    }
    loadProducts();
  }, []);


  const product = products?.find(
    (item) => item._id === id || item.slug?.current === id
  );

  useEffect(() => {
    if (!product) return;

    const fetchFavoriteStatus = async () => {
      try {
        const res = await fetch(`/api/favorites?productId=${product._id}`);
        const data = await res.json();

        if (res.ok) {
          setIsFavorite(data.isFavorite);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchFavoriteStatus();
  }, [product]);

  if (!products) {
    return <p className="text-center my-16">Loading product details...</p>;
  }

  if (!product) {
    return (
      <div className="text-center my-16">
        <p>Product not found. Please check the URL.</p>
        <a href="/" className="text-blue-500 underline">
          Go back to products
        </a>
      </div>
    );
  }

  const handleIncrement = () => {
    if (quantity < product.inventoryInStock) {
      setQuantity((prevQuantity) => prevQuantity + 1);
    }
  };

  const handleDecrement = () =>
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));


  const handleFavorite = async () => {
    if (loadingFavorite) return;

    try {
      setLoadingFavorite(true);

      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFavorite(false);
    }
  };


  return (
    <div className="w-full mx-auto py-10 mb-12 px-8 lg:px-16 flex flex-col lg:flex-row gap-10">
      <div className="basis-[50%] flex flex-col lg:flex-row gap-6 lg:gap-4">
        <div className="flex lg:flex-col gap-3 sm:gap-5">
          {product.sideImages?.map((img, idx) => (
            <Image
              key={idx}
              src={img}
              alt={`Product side image ${idx + 1}`}
              width={80}
              height={80}
              className="bg-[#F9F1E7] rounded-md object-cover w-[80px] h-[80px]"
            />
          ))}
        </div>

        <div className="relative flex justify-center items-center bg-[#F9F1E7] rounded-md w-full h-[300px] lg:h-[500px] overflow-hidden">
          <Image
            src={product.image}
            alt={`${product.title} main image`}
            width={600}
            height={600}
            className="object-contain max-w-full h-auto"
          />
        </div>
      </div>

      <div className="basis-[50%] flex flex-col gap-6">
        <h1 className="text-[30px] sm:text-[40px] font-semibold">
          {product.title}
        </h1>
        <p className="text-[#9F9F9F] text-xl sm:text-2xl">
          $ {product.price}.00
        </p>
        <div className="flex items-center gap-5 my-1">
          <p className="text-[#FFC700] text-lg">{product.stars.join(" ")}</p>
          <div className="h-[30px] w-px bg-[#9F9F9F]"></div>
          <p className="text-[13px] text-[#9F9F9F]">{product.reviews}</p>
        </div>
        <p className="text-[14px] sm:text-[15px] leading-relaxed">
          {product.description.substring(0, 573)}
        </p>

        <div className="flex flex-col gap-3">
          <p className="text-[#9F9F9F] text-sm">Tags</p>
          <div className="flex flex-wrap gap-2">
            {product.tags.split(", ").map((tag, index) => (
              <div
                key={index}
                className="px-3 py-1 text-[13px] text-black bg-[#F9F1E7] rounded-md"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2">


          <button
            onClick={handleFavorite}
            disabled={loadingFavorite}
            className="relative group flex items-center gap-2 transition"
          >
            {isFavorite ? (
              <FaHeart className="text-xl text-[#B88E2F]" />
            ) : (
              <FaRegHeart className="text-xl text-white group-hover/icon:text-[#B88E2F]" />
            )}

            <span
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
    whitespace-nowrap rounded-md bg-gray-900 px-3 py-1 text-xs text-white
    opacity-0 group-hover:opacity-100 transition pointer-events-none"
            >
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </span>

            <span className="text-sm">
              {loadingFavorite
                ? "Saving..."
                : isFavorite
                  ? "Favorited"
                  : "Favorite"}
            </span>
          </button>

          <button className="relative group flex items-center gap-2 text-gray-700 hover:text-[#B88E2F] transition">
            <IoShareSocialOutline className="text-xl" />

            <span
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
      whitespace-nowrap rounded-md bg-gray-900 px-3 py-1 text-xs text-white
      opacity-0 group-hover:opacity-100 transition pointer-events-none"
            >
              Share Product
            </span>

            <span className="text-sm">Share</span>
          </button>

          <div
            className={`relative group flex items-center gap-2 ${product.inventoryInStock > 0
              ? "text-green-700"
              : "text-red-600"
              }`}
          >
            <MdOutlineInventory2 className="text-xl" />

            <span className="text-sm">
              {product.inventoryInStock} Available
            </span>

            <span
              className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2
      whitespace-nowrap rounded-md px-3 py-1 text-xs text-white
      opacity-0 group-hover:opacity-100 transition pointer-events-none
      ${product.inventoryInStock > 0
                  ? "bg-gray-900"
                  : "bg-red-600"
                }`}
            >
              {product.inventoryInStock > 0
                ? `${product.inventoryInStock} items left`
                : "Out of Stock"}
            </span>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-2 mt-6 items-start sm:items-center text-base">
          <div className="flex items-center gap-6 border border-[#9F9F9F] rounded-md py-2 px-3 hover:bg-[#F9F1E7]">
            <span className="cursor-pointer" onClick={handleDecrement}>
              -
            </span>
            <button>{quantity}</button>
            <span className="cursor-pointer" onClick={handleIncrement}>
              +
            </span>
          </div>
          <button
            className="py-2 px-5 rounded-lg border border-black hover:bg-[#F9F1E7]"
            onClick={() => {
              if (product.inventoryInStock > 0) {
                addToCart({
                  id: product._id,
                  name: product.title,
                  price: product.price,
                  quantity: quantity,
                  image: product.image,
                });
                setQuantity(1);
              }
            }}
          >
            Add To Cart
          </button>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
