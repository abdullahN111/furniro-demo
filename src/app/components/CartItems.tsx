import { ImCancelCircle } from "react-icons/im";
import { MdCancel } from "react-icons/md";
import { useCart } from "@/app/context/CartContext";
import Image from "next/image";
import Link from "next/link";

const CartItems = ({ closeCart }: { closeCart: () => void }) => {
  const { cartItems, removeFromCart } = useCart();
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
      className="relative p-4 sm:p-6 w-[220px] h-[500px] sm:w-full max-w-[340px] bg-white shadow-lg z-[1001] rounded-es-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-5">
          <h3 className="text-xl sm:text-2xl font-semibold">Shopping Cart</h3>
          <div className="border border-[#D9D9D9] w-[110%] sm:w-[140%]"></div>
        </div>
        <button
          className="mt-2 cursor-pointer text-[#9F9F9F]"
          onClick={closeCart}
        >
          <ImCancelCircle />
        </button>
      </div>

      <div className="flex flex-col gap-8 sm:gap-5 my-7 h-[280px] overflow-y-auto">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-2 sm:gap-0 flex-col sm:flex-row items-center justify-between"
            >
              <div>
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-md object-cover w-[80px] h-[80px]"
                />
              </div>
              <div className="mx-0 text-center sm:text-start sm:mr-6 w-[150px] sm:w-[100px] sm:break-words line-clamp-2">
                <p className="text-[15px] font-semibold">{item.name}</p>
                <div>
                  <p className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-[15px]">{item.quantity}</span>
                    <span className="text-base">&times;</span>
                    <span className="text-xs text-[#B88E2F] font-semibold">
                      $ {item.price}.00
                    </span>
                  </p>
                </div>
              </div>
              <button
                className="text-[#9F9F9F] cursor-pointer mr-0 sm:mr-2"
                onClick={() => removeFromCart(item.id)}
              >
                <MdCancel />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Your cart is empty.</p>
        )}
      </div>

      <div className="absolute bottom-0 w-full">
        {cartItems.length > 0 && (
          <>
            <div className="flex mb-4 gap-4 sm:gap-0 items-center justify-between">
              <p className="text-[15px]">Subtotal</p>
              <p className="mr-8 sm:mr-16 text-[15px] text-[#B88E2F] font-semibold">
                $ {itemsTotal}.00
              </p>
            </div>
            <div className="border border-[#D9D9D9] w-full"></div>

            <div className="flex items-center justify-center gap-3 my-5 mr-8">
              {cartItems.length > 0 && (
                <>
                  <Link href="/cart">
                    <button
                      onClick={closeCart}
                      className="cursor-pointer text-xs hover:bg-[#F9F1E7] py-1 px-5 rounded-full border border-black"
                    >
                      Cart
                    </button>
                  </Link>
                  <Link href="/checkout">
                    <button
                      onClick={closeCart}
                      className="cursor-pointer text-xs hover:bg-[#F9F1E7] py-1 px-6 rounded-full border border-black"
                    >
                      Checkout
                    </button>
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartItems;
