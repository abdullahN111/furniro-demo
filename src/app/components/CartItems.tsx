"use client";

import { FiX, FiTrash2, FiShoppingBag } from "react-icons/fi";
import { useCart } from "@/app/context/CartContext";
import Image from "next/image";
import Link from "next/link";

const CartItems = ({ closeCart }: { closeCart: () => void }) => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const itemsTotal = cartItems.reduce((total, item) => {
    let price = item.price;
    if (typeof price === "string") {
      price = price.replace(/[^0-9.]+/g, "");
    }
    const parsedPrice = parseFloat(price as string);
    const validPrice = isNaN(parsedPrice) ? 0 : parsedPrice;
    return total + validPrice * item.quantity;
  }, 0);

  return (
    <div
      className="relative flex flex-col justify-between p-5 sm:p-6 w-full max-w-[380px] h-full sm:h-[560px] bg-white shadow-2xl z-[1001] sm:rounded-bl-xl border-l border-gray-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <FiShoppingBag className="text-[#B88E2F] text-xl" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
            Shopping Cart
          </h3>
          {cartItems.length > 0 && (
            <span className="text-xs font-semibold bg-[#F9F1E7] text-[#B88E2F] px-2 py-0.5 rounded-full">
              {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label="Close shopping cart"
          className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={closeCart}
        >
          <FiX className="text-lg" />
        </button>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4">
        {cartItems.length > 0 ? (
          cartItems.map((item) => {
            const unitPrice =
              typeof item.price === "string"
                ? parseFloat(item.price.replace(/[^0-9.]+/g, "")) || 0
                : item.price;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs font-semibold text-[#B88E2F] mt-0.5">
                    ${unitPrice.toFixed(2)}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="inline-flex items-center border border-gray-200 rounded-md bg-white">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() =>
                          item.quantity > 1
                            ? updateQuantity(item.id, item.quantity - 1)
                            : removeFromCart(item.id)
                        }
                        className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-[#F9F1E7] hover:text-[#B88E2F] transition-colors rounded-l-md"
                      >
                        -
                      </button>
                      <span className="px-2.5 text-xs font-semibold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-[#F9F1E7] hover:text-[#B88E2F] transition-colors rounded-r-md"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label={`Remove ${item.name} from cart`}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
                  onClick={() => removeFromCart(item.id)}
                >
                  <FiTrash2 className="text-base" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-14 h-14 rounded-full bg-[#F9F1E7] flex items-center justify-center text-[#B88E2F] mb-3">
              <FiShoppingBag className="text-2xl" />
            </div>
            <p className="text-base font-semibold text-gray-800">
              Your cart is empty
            </p>
            <p className="text-xs text-gray-500 mt-1 mb-5 max-w-[220px]">
              Explore our curated furniture collection to find pieces for your
              home.
            </p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="text-xs font-semibold text-white bg-[#B88E2F] hover:bg-[#9f7924] px-5 py-2.5 rounded-md transition-colors"
            >
              Browse Shop
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      {cartItems.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Subtotal</span>
            <span className="text-base font-bold text-[#B88E2F]">
              ${itemsTotal.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/cart"
              onClick={closeCart}
              className="text-center text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-full border border-gray-800 text-gray-800 hover:bg-[#F9F1E7] hover:border-[#B88E2F] transition-colors"
            >
              View Cart
            </Link>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="text-center text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-full bg-[#B88E2F] text-white hover:bg-[#9f7924] transition-colors"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItems;
