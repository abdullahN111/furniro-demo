"use client";

import Image from "next/image";
import Logo from "@/app/public/assets/images/main/Logo.png";
import { TbUserExclamation } from "react-icons/tb";
import { FiSearch, FiHeart, FiMenu, FiX } from "react-icons/fi";
import { MdOutlineLocalGroceryStore } from "react-icons/md";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";
import { useFavorites } from "@/app/context/FavoritesContext";

import CartItems from "@/app/components/CartItems";
import SmNavbar from "@/app/components/shared/SmNavbar";
import LgNavbar from "@/app/components/shared/LgNavbar";

import ClientAccountInfo from "@/app/components/ClientAccountInfo";
import SearchBox from "../SearchBox";

interface User {
  name?: string;
  email?: string;
  image?: string;
}

const Header = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openAccountInfo, setOpenAccountInfo] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [openSearch, setOpenSearch] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  const { cartItems } = useCart();
  const { favoriteCount } = useFavorites();

  const totalCartUnits = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      try {
        const res = await fetch("/api/account-info");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || null);
        }

        const orderRes = await fetch("/api/order/count");
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrderCount(orderData.count || 0);
        }
      } catch (err) {
        console.error("Failed to fetch header account info:", err);
      }
    };
    fetchUserAndOrders();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenCart(false);
        setOpenAccountInfo(false);
        setOpenMenu(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleMenu = () => {
    setOpenMenu((prev) => !prev);
  };

  const closeMenu = () => {
    setOpenMenu(false);
  };

  const toggleCart = () => {
    setOpenMenu(false);
    setOpenAccountInfo(false);
    setOpenCart((prev) => !prev);
  };

  const toggleAccountInfo = () => {
    setOpenMenu(false);
    setOpenCart(false);
    setOpenAccountInfo((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-[1000] bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="mx-auto max-w-[1440px] h-[80px] lg:h-[88px] px-5 sm:px-8 lg:px-[54px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src={Logo}
            alt="Furniro logo"
            width={45}
            height={30}
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-[24px] md:text-[30px] font-bold tracking-tight text-gray-900">
            Furniro
          </span>
        </Link>

        <LgNavbar />

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-6 text-[23px] text-gray-800">
          <button
            type="button"
            aria-label="Open search"
            onClick={() => {
              setOpenMenu(false);
              setOpenSearch((prev) => !prev);
            }}
            className="p-2 rounded-full hover:bg-[#F9F1E7] hover:text-[#B88E2F] transition-colors"
          >
            <FiSearch />
          </button>

          <Link
            href="/favorites"
            aria-label="View favorites"
            className="relative p-2 rounded-full hover:bg-[#F9F1E7] hover:text-[#B88E2F] transition-colors"
          >
            <FiHeart />
            {favoriteCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[11px] font-bold rounded-full min-w-[19px] h-[19px] px-1 flex items-center justify-center shadow-xs">
                {favoriteCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label="Open shopping cart"
            onClick={toggleCart}
            className="relative p-2 rounded-full hover:bg-[#F9F1E7] hover:text-[#B88E2F] transition-colors"
          >
            <MdOutlineLocalGroceryStore className="text-[25px]" />
            {totalCartUnits > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#B88E2F] text-white text-[11px] font-bold rounded-full min-w-[19px] h-[19px] px-1 flex items-center justify-center shadow-xs">
                {totalCartUnits}
              </span>
            )}
          </button>

          <button
            type="button"
            aria-label="Open account menu"
            onClick={toggleAccountInfo}
            className="relative p-1.5 rounded-full hover:ring-2 hover:ring-[#B88E2F]/40 transition-all"
          >
            {user ? (
              user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-[32px] h-[32px] rounded-full bg-[#B88E2F] text-white flex items-center justify-center text-sm font-bold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )
            ) : (
              <TbUserExclamation className="text-[25px]" />
            )}

            {orderCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                {orderCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Quick Actions + Hamburger */}
        <div className="flex lg:hidden items-center gap-2 text-gray-800">
          <button
            type="button"
            aria-label="Open search"
            onClick={() => {
              setOpenMenu(false);
              setOpenSearch(true);
            }}
            className="p-2 rounded-full hover:bg-[#F9F1E7] text-xl"
          >
            <FiSearch />
          </button>

          <Link
            href="/favorites"
            aria-label="View favorites"
            className="relative p-2 rounded-full hover:bg-[#F9F1E7] text-xl"
          >
            <FiHeart />
            {favoriteCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center">
                {favoriteCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label="Open shopping cart"
            onClick={toggleCart}
            className="relative p-2 rounded-full hover:bg-[#F9F1E7] text-2xl"
          >
            <MdOutlineLocalGroceryStore />
            {totalCartUnits > 0 && (
              <span className="absolute top-0 right-0 bg-[#B88E2F] text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center">
                {totalCartUnits}
              </span>
            )}
          </button>

          <button
            type="button"
            aria-label={openMenu ? "Close menu" : "Open menu"}
            onClick={toggleMenu}
            className="p-2 rounded-full hover:bg-[#F9F1E7] text-2xl"
          >
            {openMenu ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Single Mounted Search Modal */}
      {openSearch && <SearchBox close={() => setOpenSearch(false)} />}

      {/* Mobile Navigation Drawer */}
      <div
        className={`lg:hidden fixed left-0 top-[80px] w-full bg-white border-b border-gray-200 shadow-xl z-[999] transition-all ease-in-out duration-200 ${
          openMenu
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <SmNavbar closeMenu={closeMenu} />
        <div className="flex justify-center items-center gap-4 pb-5 pt-2 border-t border-gray-100 mx-6">
          <button
            type="button"
            onClick={toggleAccountInfo}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F9F1E7] text-sm font-semibold text-gray-800 hover:bg-[#B88E2F] hover:text-white transition-colors"
          >
            {user ? (
              <span>{user.name || "My Account"}</span>
            ) : (
              <span>Account / Sign In</span>
            )}
            {orderCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {orderCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Cart Drawer Overlay */}
      <div
        onClick={() => setOpenCart(false)}
        className={`fixed inset-0 w-full h-screen bg-black/30 backdrop-blur-[1px] z-[1000] flex justify-end transition-opacity duration-300 ${
          openCart ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <CartItems closeCart={() => setOpenCart(false)} />
      </div>

      {/* Account Drawer Overlay */}
      <div
        onClick={() => setOpenAccountInfo(false)}
        className={`fixed inset-0 w-full h-screen bg-black/30 backdrop-blur-[1px] z-[1000] flex justify-end transition-opacity duration-300 ${
          openAccountInfo ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <ClientAccountInfo
          close={() => setOpenAccountInfo(false)}
          favoriteCount={favoriteCount}
          user={user}
          orderCount={orderCount}
        />
      </div>
    </header>
  );
};

export default Header;
