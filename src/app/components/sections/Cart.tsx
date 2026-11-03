"use client";

import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/context/ToastContext";
import Link from "next/link";
import { FiTrash2, FiShoppingBag, FiArrowRight, FiCheck } from "react-icons/fi";
import { fetchProducts, ProductCardData } from "@/app/Data";
import { useEffect, useState } from "react";

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    selectedItems,
    setSelectedItems,
  } = useCart();
  const { showToast } = useToast();
  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    async function loadProducts() {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
    }

    loadProducts();
  }, []);

  const parsePrice = (raw: string | number) => {
    const cleaned =
      typeof raw === "string" ? parseFloat(raw.replace(/[^0-9.]+/g, "")) : raw;
    return isNaN(cleaned) ? 0 : cleaned;
  };

  const allSelected =
    cartItems.length > 0 &&
    cartItems.every((item) => selectedItems.includes(item.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((i) => i.id));
    }
  };

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(item.id)
  );

  const selectedUnitsCount = selectedCartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const cartTotal = selectedCartItems.reduce((total, item) => {
    return total + parsePrice(item.price) * item.quantity;
  }, 0);

  if (cartItems.length === 0) {
    return (
      <section className="max-w-[1440px] bg-white mx-auto px-5 sm:px-10 lg:px-16 py-20">
        <div className="max-w-md mx-auto text-center bg-[#FCF8F3] border border-[#f0e4d3] rounded-2xl p-10 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#F9F1E7] text-[#B88E2F] flex items-center justify-center mx-auto mb-4">
            <FiShoppingBag className="text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Shopping Cart is Empty
          </h2>
          <p className="text-sm text-gray-500 mb-7 leading-relaxed">
            Discover our handcrafted dining, living, and bedroom collections to
            start curating your space.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-[#B88E2F] hover:bg-[#9f7924] text-white font-semibold text-sm sm:text-base px-8 py-3.5 rounded-xl transition-colors shadow-sm"
          >
            <span>Explore Shop</span>
            <FiArrowRight />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1440px] bg-white mx-auto px-4 sm:px-8 lg:px-12 py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="w-full lg:flex-1 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between bg-[#FCF8F3] border border-[#f0e4d3] rounded-xl px-5 py-3.5">
            <label className="inline-flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 accent-[#B88E2F] rounded cursor-pointer"
              />
              <span className="text-sm font-semibold text-gray-800">
                Select All ({cartItems.length} item
                {cartItems.length === 1 ? "" : "s"})
              </span>
            </label>

            <button
              type="button"
              onClick={() => {
                clearCart();
                showToast({
                  message: "Shopping cart cleared",
                  type: "info",
                });
              }}
              className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
            >
              Clear Cart
            </button>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
            <div className="bg-[#F9F1E7] px-6 py-4 grid grid-cols-12 gap-4 text-sm font-bold text-gray-800 uppercase tracking-wider">
              <div className="col-span-1 flex justify-center">
                <FiCheck className="text-[#B88E2F]" />
              </div>
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Unit Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => {
                const unitPrice = parsePrice(item.price);
                const subtotal = unitPrice * item.quantity;
                const product = products.find((p) => p._id === item.id);
                const slug = product?.slug?.current || item.id;
                const isSelected = selectedItems.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`grid grid-cols-12 gap-4 px-6 py-5 items-center transition-colors ${
                      isSelected ? "bg-white" : "bg-gray-50/60 opacity-75"
                    }`}
                  >
                    <div className="col-span-1 flex justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItem(item.id)}
                        aria-label={`Select ${item.name}`}
                        className="w-4 h-4 accent-[#B88E2F] rounded cursor-pointer"
                      />
                    </div>

                    <div className="col-span-5 flex items-center gap-4 min-w-0">
                      <Link
                        href={`/product/${slug}`}
                        className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#F9F1E7] shrink-0 border border-gray-100"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform"
                          sizes="80px"
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link
                          href={`/product/${slug}`}
                          className="font-bold text-gray-900 hover:text-[#B88E2F] transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        {product?.featured && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {product.featured}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 text-center text-sm font-medium text-gray-600">
                      ${unitPrice.toFixed(2)}
                    </div>

                    <div className="col-span-2 flex justify-center">
                      <div className="inline-flex items-center border border-gray-200 rounded-xl bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            item.quantity > 1
                              ? updateQuantity(item.id, item.quantity - 1)
                              : removeFromCart(item.id)
                          }
                          className="w-8 h-8 text-gray-600 hover:text-[#B88E2F] hover:bg-[#F9F1E7] rounded-l-xl font-bold transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 text-gray-600 hover:text-[#B88E2F] hover:bg-[#F9F1E7] rounded-r-xl font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-3">
                      <span className="text-sm font-bold text-gray-900">
                        ${subtotal.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => {
                          removeFromCart(item.id);
                          showToast({
                            message: `Removed "${item.name}" from cart`,
                            type: "info",
                          });
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <FiTrash2 size={17} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {cartItems.map((item) => {
              const unitPrice = parsePrice(item.price);
              const subtotal = unitPrice * item.quantity;
              const product = products.find((p) => p._id === item.id);
              const slug = product?.slug?.current || item.id;
              const isSelected = selectedItems.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl shadow-xs border p-4 transition-colors ${
                    isSelected
                      ? "border-gray-200"
                      : "border-gray-100 bg-gray-50/60 opacity-75"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItem(item.id)}
                      className="mt-1.5 w-4 h-4 accent-[#B88E2F] rounded shrink-0"
                    />

                    <div className="flex-1 flex justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <Link
                          href={`/product/${slug}`}
                          className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#F9F1E7] shrink-0"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </Link>

                        <div className="min-w-0">
                          <Link href={`/product/${slug}`}>
                            <h3 className="font-bold text-gray-900 text-sm truncate">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-xs font-semibold text-[#B88E2F] mt-0.5">
                            ${unitPrice.toFixed(2)} each
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          removeFromCart(item.id);
                          showToast({
                            message: `Removed "${item.name}" from cart`,
                            type: "info",
                          });
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 self-start"
                      >
                        <FiTrash2 size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <div className="inline-flex items-center border border-gray-200 rounded-xl bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          item.quantity > 1
                            ? updateQuantity(item.id, item.quantity - 1)
                            : removeFromCart(item.id)
                        }
                        className="w-8 h-8 text-gray-600 hover:text-[#B88E2F] font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 text-gray-600 hover:text-[#B88E2F] font-bold"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-base font-bold text-gray-900">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Cart Totals Sticky Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-[#FCF8F3] border border-[#f0e4d3] rounded-2xl shadow-xs p-6 sm:p-8 sticky top-28">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-3.5 text-sm border-b border-[#e6d8c3] pb-5 mb-5">
              <div className="flex justify-between text-gray-600">
                <span>Selected Items</span>
                <span className="font-semibold text-gray-900">
                  {selectedUnitsCount} unit{selectedUnitsCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-700">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline mb-6">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-[#B88E2F]">
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            {selectedCartItems.length > 0 ? (
              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#B88E2F] hover:bg-[#9f7924] text-white py-3.5 px-6 rounded-xl font-semibold text-sm sm:text-base transition-colors shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <FiArrowRight />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="w-full bg-gray-200 text-gray-500 py-3.5 px-6 rounded-xl font-semibold text-sm cursor-not-allowed"
              >
                Select at least 1 item to checkout
              </button>
            )}

            <Link
              href="/shop"
              className="block text-center text-xs font-semibold text-gray-500 hover:text-[#B88E2F] mt-4 transition-colors"
            >
              &larr; Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;
