"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { StaticImageData } from "next/image";
import { useSession } from "next-auth/react";

export type CartItem = {
  id: string;
  name: string;
  price: number | string;
  quantity: number;
  image: string | StaticImageData;
};

type CartContextType = {
  cartItems: CartItem[];
  selectedItems: string[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  removeSelectedItems: (ids: string[]) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const getKey = () => (userEmail ? `cart-${userEmail}` : "cart-guest");

  const loadCart = () => {
    if (typeof window === "undefined") return;
    const key = getKey();
    const stored = localStorage.getItem(key);
    const guest = localStorage.getItem("cart-guest");

    const guestItems = guest ? JSON.parse(guest) : [];
    const storedItems = stored ? JSON.parse(stored) : [];

    if (userEmail) {
      const merged = mergeCarts(guestItems, storedItems);
      localStorage.removeItem("cart-guest");
      localStorage.setItem(key, JSON.stringify(merged));
      setCartItems(merged);
    } else {
      setCartItems(guestItems);
    }
  };

  const saveCart = (items: CartItem[]) => {
    if (typeof window === "undefined") return;
    const key = getKey();
    localStorage.setItem(key, JSON.stringify(items));
  };

  const mergeCarts = (a: CartItem[], b: CartItem[]) => {
    const map = new Map<string, CartItem>();
    b.forEach((item) => map.set(item.id, item));
    a.forEach((item) => {
      if (map.has(item.id)) {
        const existing = map.get(item.id)!;
        map.set(item.id, {
          ...item,
          quantity: item.quantity + existing.quantity,
        });
      } else {
        map.set(item.id, item);
      }
    });
    return Array.from(map.values());
  };

  useEffect(() => {
    loadCart();
    setIsMounted(true);
  }, [userEmail]);

  useEffect(() => {
    if (!isMounted) return;
    saveCart(cartItems);
  }, [cartItems]);

  useEffect(() => {
    setSelectedItems((prev) =>
      prev.filter((id) => cartItems.some((item) => item.id === id)),
    );
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    const exists = cartItems.some((i) => i.id === item.id);

    setCartItems((prev) =>
      exists
        ? prev.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          )
        : [...prev, item],
    );

    if (!exists) {
      setSelectedItems((prev) => [...prev, item.id]);
    }
  };
  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };
  const removeSelectedItems = (ids: string[]) => {
    setCartItems((prev) => prev.filter((item) => !ids.includes(item.id)));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(getKey());
    }
  };

  if (!isMounted) return null;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        removeSelectedItems,
        selectedItems,
        setSelectedItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
