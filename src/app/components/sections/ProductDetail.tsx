"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { ProductCardData, fetchProducts } from "@/app/Data/index";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";

const ProductDetail = () => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<ProductCardData[] | null>(null);

  useEffect(() => {
    async function loadProducts() {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
    }
    loadProducts();
  }, []);

  if (!products) {
    return <p className="text-center my-16">Loading product details...</p>;
  }

  const product = products.find(
    (item) => item._id === id || item.slug?.current === id
  );

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

        {/* Tags */}
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

        {/* Quantity and Cart Actions */}
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
          <div className="py-2 px-5 rounded-lg border border-black hover:bg-[#F9F1E7]">
            <button>Stock: {product.inventoryInStock}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
