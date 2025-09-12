"use client";

import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { MdCancel } from "react-icons/md";
import { fetchProducts, ProductCardData } from "@/app/Data";
import { useEffect, useState } from "react";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    async function loadProducts() {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
    }

    loadProducts();
  }, []);

  const cartTotal = cartItems.reduce((total, item) => {
    const price = parseFloat(item.price.toString().replace(/[^0-9.]+/g, ""));
    return total + (isNaN(price) ? 0 : price * item.quantity);
  }, 0);

  return (
    <section className="max-w-[1440px] bg-white container mx-auto px-6 sm:px-24 md:px-8 xl:px-12 py-8">
      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8">
        <div className="hidden md:block flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#F9F1E7] px-6 py-4 grid grid-cols-12 gap-4 text-base font-semibold">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => {
                const subtotal =
                  parseFloat(item.price.toString().replace(/[^0-9.]+/g, "")) *
                  item.quantity;

                const product = products.find((p) => p._id === item.id);
                const slug = product?.slug.current;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center"
                  >
                    <div className="col-span-5 flex items-center space-x-4">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Link href={`/add-to-cart/${slug}`}>
                          <Image
                            src={item.image}
                            alt="product"
                            fill
                            className="rounded-md object-cover"
                            sizes="64px"
                          />
                        </Link>
                      </div>
                      <Link href={`/add-to-cart/${slug}`}>
                        <span className="text-gray-700 font-medium">
                          {item.name}
                        </span>
                      </Link>
                    </div>

                    <div className="col-span-2 text-center text-gray-600">
                      $ {item.price}
                    </div>

                    <div className="col-span-3 flex justify-center">
                      <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-2 py-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-1 text-gray-600 hover:text-[#B88E2F]"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          min={1}
                          readOnly
                          className="w-6 text-center border-none bg-transparent focus:outline-none"
                        />
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-1 text-gray-600 hover:text-[#B88E2F]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-end space-x-4">
                      <span className="text-gray-800 font-medium">
                        $ {subtotal}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <MdCancel size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="md:hidden space-y-4">
          {cartItems.map((item) => {
            const subtotal =
              parseFloat(item.price.toString().replace(/[^0-9.]+/g, "")) *
              item.quantity;

            const product = products.find((p) => p._id === item.id);
            const slug = product?.slug.current;

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Link href={`/add-to-cart/${slug}`}>
                        <Image
                          src={item.image}
                          alt="product"
                          fill
                          className="rounded-md object-cover"
                          sizes="64px"
                        />
                      </Link>
                    </div>
                    <div>
                      <Link href={`/add-to-cart/${slug}`}>
                        <h3 className="font-medium text-gray-800">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm">$ {item.price}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <MdCancel size={18} />
                  </button>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-1 text-gray-600 hover:text-[#B88E2F]"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      min={1}
                      readOnly
                      className="w-6 text-center border-none bg-transparent focus:outline-none"
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-1 text-gray-600 hover:text-[#B88E2F]"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-gray-800 font-medium">
                    $ {subtotal}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:w-96 xl:w-80">
          <div className="bg-[#F9F1E7] rounded-lg shadow-sm p-6 sticky top-6">
            <h2 className="text-2xl font-semibold text-center mb-6">
              Cart Totals
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="text-gray-700">$ {cartTotal}.00</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-gray-800">Total</span>
                <span className="text-[#B88E2F] text-xl">$ {cartTotal}.00</span>
              </div>
            </div>

            {cartItems.length > 0 ? (
              <Link href="/checkout">
                <button className="w-full bg-white border border-gray-800 text-gray-800 py-3 rounded-xl hover:bg-[#B88E2F] hover:text-white hover:border-[#B88E2F] transition-colors font-medium">
                  Check Out
                </button>
              </Link>
            ) : (
              <Link href="/shop">
                <button className="w-full bg-white border border-gray-800 text-gray-800 py-3 rounded-xl hover:bg-[#B88E2F] hover:text-white hover:border-[#B88E2F] transition-colors font-medium">
                  Start Shopping
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;
