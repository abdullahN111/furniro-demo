"use client";

import { useEffect, useState } from "react";
import { ImCancelCircle } from "react-icons/im";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FaRegHeart, FaShoppingBag, FaSignOutAlt } from "react-icons/fa";

interface User {
  name?: string;
  email?: string;
  image?: string;
}

const ClientAccountInfo = ({ close }: { close: () => void }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/account-info");
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div
      className="relative px-4 py-5 sm:py-6 sm:px-5 w-[280px] xsx:w-[320px] bg-white shadow-lg z-[1001] rounded-md flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
     
      <div className="flex justify-end absolute right-3 top-3">
        <button 
          className="text-[#9F9F9F] hover:text-gray-700 transition-colors"
          onClick={close}
          aria-label="Close account menu"
        >
          <ImCancelCircle size={18} />
        </button>
      </div>

    
      <div className="flex flex-col items-center justify-center gap-2 pt-6 pb-4">
        {user?.image && (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={70}
            height={70}
            className="rounded-full object-cover border-2 border-gray-200"
          />
        )}
        <p className="text-[17px] font-medium text-center text-gray-800">
          {user?.name || "Guest User"}
        </p>
        <p className="text-[13px] text-gray-500 text-center max-w-full truncate">
          {user?.email || "No email"}
        </p>
      </div>

      <div className="border-t border-gray-200 my-2" />

    
      <div className="flex flex-col space-y-2 py-2">
        <Link 
          href="/orders" 
          className="flex items-center px-3 py-2 text-gray-700 hover:bg-[#F9F1E7] rounded-md transition-colors"
          onClick={close}
        >
          <FaShoppingBag className="mr-3 text-[#B88E2F]" />
          <span className="text-sm">My Orders</span>
        </Link>
        
        <div className="flex items-center px-3 py-2 text-gray-500 cursor-not-allowed opacity-70">
          <FaRegHeart className="mr-3" />
          <span className="text-sm">Favorites</span>
        </div>
        
        
      </div>

      <div className="border-t border-gray-200 my-2" />

      
      <div className="pt-2 pb-3">
        {user ? (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center justify-center w-full text-sm hover:bg-gray-100 py-2 px-4 rounded-md text-gray-700 transition-colors"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        ) : (
          <Link href="/login" onClick={close}>
            <button className="w-full text-sm hover:bg-[#F9F1E7] py-2 px-4 rounded-full border border-black transition-colors">
              Login
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ClientAccountInfo;