"use client";

import { FiX, FiUserPlus, FiLogIn } from "react-icons/fi";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FaRegHeart, FaShoppingBag, FaSignOutAlt } from "react-icons/fa";
import { CgTrack } from "react-icons/cg";

interface User {
  name?: string;
  email?: string;
  image?: string;
}

const ClientAccountInfo = ({
  close,
  favoriteCount,
  user,
  orderCount = 0,
}: {
  close: () => void;
  favoriteCount: number;
  user?: User | null;
  orderCount?: number;
}) => {
  return (
    <div
      className="relative px-5 py-6 w-[290px] sm:w-[320px] h-fit bg-white shadow-2xl z-[1001] rounded-bl-xl border-l border-b border-gray-100 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-end absolute right-3.5 top-3.5">
        <button
          type="button"
          className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={close}
          aria-label="Close account menu"
        >
          <FiX size={18} />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 pt-4 pb-4">
        {user ? (
          user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              width={68}
              height={68}
              className="rounded-full object-cover border-2 border-[#F9F1E7]"
            />
          ) : (
            <div className="w-[68px] h-[68px] rounded-full bg-[#B88E2F] text-white flex items-center justify-center text-2xl font-bold">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )
        ) : (
          <div className="w-[64px] h-[64px] rounded-full bg-[#F9F1E7] text-[#B88E2F] flex items-center justify-center text-xl font-bold">
            G
          </div>
        )}
        <p className="text-base font-semibold text-center text-gray-800 mt-1">
          {user?.name || "Guest User"}
        </p>
        <p className="text-xs text-gray-500 text-center max-w-full truncate">
          {user?.email || "Sign in to manage orders & favorites"}
        </p>
      </div>

      <div className="border-t border-gray-100 my-2" />

      <div className="flex flex-col space-y-1.5 py-2">
        <Link
          href="/orders"
          className="flex items-center justify-between px-3 py-2.5 text-gray-700 hover:bg-[#F9F1E7] rounded-lg transition-colors"
          onClick={close}
        >
          <div className="flex items-center">
            <FaShoppingBag className="mr-3 text-[#B88E2F]" />
            <span className="text-sm font-medium">My Orders</span>
          </div>
          {orderCount > 0 && (
            <span className="bg-[#B88E2F] text-white text-xs font-semibold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
              {orderCount}
            </span>
          )}
        </Link>

        <Link
          href="/favorites"
          onClick={close}
          className="flex items-center justify-between px-3 py-2.5 text-gray-700 hover:bg-[#F9F1E7] rounded-lg transition-colors"
        >
          <div className="flex items-center">
            <FaRegHeart className="mr-3 text-[#B88E2F]" />
            <span className="text-sm font-medium">Favorites</span>
          </div>

          {favoriteCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
              {favoriteCount}
            </span>
          )}
        </Link>

        <Link
          href="/track-order"
          className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-[#F9F1E7] rounded-lg transition-colors"
          onClick={close}
        >
          <CgTrack className="mr-3 text-[#B88E2F]" />
          <span className="text-sm font-medium">Track Order</span>
        </Link>
      </div>

      <div className="border-t border-gray-100 my-2" />

      <div className="pt-2">
        {user ? (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center justify-center w-full text-sm font-medium hover:bg-red-50 hover:text-red-600 py-2.5 px-4 rounded-lg text-gray-700 transition-colors"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              href="/login"
              onClick={close}
              className="flex items-center justify-center gap-2 w-full text-center text-sm font-semibold bg-[#B88E2F] text-white hover:bg-[#9f7924] py-2.5 px-4 rounded-full transition-colors"
            >
              <FiLogIn />
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={close}
              className="flex items-center justify-center gap-2 w-full text-center text-sm font-semibold border border-[#B88E2F] text-[#B88E2F] hover:bg-[#F9F1E7] py-2.5 px-4 rounded-full transition-colors"
            >
              <FiUserPlus />
              Create Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientAccountInfo;
