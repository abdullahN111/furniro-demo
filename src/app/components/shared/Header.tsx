"use client";

import Image from "next/image";
import Logo from "@/app/public/assets/images/main/Logo.png";
import { TbUserExclamation } from "react-icons/tb";
import { FiSearch } from "react-icons/fi";
import { MdOutlineLocalGroceryStore } from "react-icons/md";
import { FcMenu } from "react-icons/fc";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";

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

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/account-info");
      const data = await res.json();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  const { cartItems } = useCart();

  const toggleMenu = () => {
    setOpenMenu((prev) => !prev);
  };

  const closeMenu = () => {
    setOpenMenu(false);
  };

  const toggleCart = () => {
    setOpenCart((prev) => !prev);
  };

  const toggleAccountInfo = () => {
    setOpenAccountInfo((prev) => {
      if (!prev) {
        setOpenMenu(false);
      }
      return !prev;
    });
  };

  return (
    <header
      className={`bg-[#FFFFFF] mx-auto max-w-[1440px] h-24 px-6 lg:px-[54px] transition-all duration-300 ease-in-out 
    ${cartItems.length > 0 ? "sticky top-0 z-[1000] shadow-md" : "relative"}
  `}
    >
      <div className="flex items-center justify-between h-full">
        <Link href="/">
          <div className="flex items-center gap-2">
            <Image src={Logo} alt="furniro logo" width={46} height={30} />
            <h2 className="text-[24px] md:text-[34px] font-bold font-montserrat">
              Furniro
            </h2>
          </div>
        </Link>

        <LgNavbar />

        <div className="hidden lg:flex text-[26px] gap-8 items-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              setOpenSearch((prev) => !prev);
            }}
            className="cursor-pointer hover:shadow-[0_1px_0_rgba(0,0,0,0.2)] transition-shadow"
          >
            <FiSearch />
          </button>
          {openSearch && (
            <div className="absolute top-24 left-0 w-full z-[2000] p-4">
              <SearchBox close={() => setOpenSearch(false)} />
            </div>
          )}
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              toggleCart();
            }}
            className="relative cursor-pointer hover:shadow-[0_1px_0_rgba(0,0,0,0.2)] transition-shadow"
          >
            <MdOutlineLocalGroceryStore />
            {cartItems.length > 0 && (
              <div className="absolute top-[-8px] right-[-8px] bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </div>
            )}
          </Link>
          <Link
            href="/"
            className="cursor-pointer hover:shadow-[0_1px_0_rgba(0,0,0,0.2)] transition-shadow"
            onClick={(e) => {
              e.preventDefault();
              toggleAccountInfo();
            }}
          >
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={31}
                height={31}
                className="rounded-full object-cover"
              />
            ) : (
              <TbUserExclamation />
            )}
          </Link>
        </div>

        <div className="lg:hidden">
          <button onClick={toggleMenu} className="relative text-3xl">
            <FcMenu />
            {cartItems.length > 0 && (
              <div className="absolute top-[-8px] right-[-8px] bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </div>
            )}
          </button>
        </div>
      </div>

      <div
        className={`fixed left-0 top-24 inset-0 w-full h-[50%] bg-white shadow-md z-[1000] transition-all ease-in-out duration-300 ${openMenu ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        <SmNavbar closeMenu={closeMenu} />
        <div className="flex justify-center gap-6 py-4 text-[25px]">
          <button
            onClick={(e) => {
              e.preventDefault();
              setOpenSearch((prev) => !prev);
            }}
            className="cursor-pointer hover:shadow-[0_1px_0_rgba(0,0,0,0.2)] transition-shadow"
          >
            <FiSearch />
          </button>
          {openSearch && (
            <div className="absolute top-24 left-0 w-full z-[2000] p-4">
              <SearchBox close={() => setOpenSearch(false)} />
            </div>
          )}

          <button
            onClick={toggleCart}
            className="relative cursor-pointer hover:shadow-[0_1px_0_rgba(0,0,0,0.2)] transition-shadow"
          >
            <MdOutlineLocalGroceryStore />
            {cartItems.length > 0 && (
              <div className="absolute top-[-8px] right-[-8px] bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </div>
            )}
          </button>
          <Link
            href="/"
            className="cursor-pointer hover:shadow-[0_1px_0_rgba(0,0,0,0.2)] transition-shadow"
            onClick={(e) => {
              e.preventDefault();
              toggleAccountInfo();
            }}
          >
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={31}
                height={31}
                className="rounded-full object-cover"
              />
            ) : (
              <TbUserExclamation />
            )}
          </Link>
        </div>
      </div>

      <div
        onClick={() => setOpenCart(false)}
        className={`fixed right-0 top-0 inset-0 w-full h-screen bg-black bg-opacity-20 z-[1000] flex justify-end 
        transition-all ease-in-out duration-300 ${openCart ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <CartItems closeCart={() => setOpenCart(false)} />
      </div>
      <div
        onClick={() => setOpenAccountInfo(false)}
        className={`fixed right-0 top-0 inset-0 w-full h-screen bg-black bg-opacity-20 z-[1000] flex justify-end 
        transition-all ease-in-out duration-300 ${openAccountInfo ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <ClientAccountInfo close={() => setOpenAccountInfo(false)} />
      </div>
    </header>
  );
};

export default Header;
