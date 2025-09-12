"use client";

import { useState, useEffect } from "react";
import { fetchProducts, ProductCardData } from "@/app/Data";
import { staticRoutes } from "@/app/Data/index";
import Link from "next/link";

export default function SearchBox({ close }: { close?: () => void }) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductCardData[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<typeof staticRoutes>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredProducts([]);
      setFilteredRoutes([]);
      return;
    }

    const lower = query.toLowerCase();


    const prod = products.filter((p) =>
      p.title.toLowerCase().includes(lower) ||
      p.tags.toLowerCase().includes(lower)
    );

  
    const routes = staticRoutes.filter((r) =>
      r.title.toLowerCase().includes(lower)
    );

    setFilteredProducts(prod.slice(0, 5)); 
    setFilteredRoutes(routes);
  }, [query, products]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for products or pages..."
        className="w-full px-4 py-2 border rounded-md focus:outline-none"
      />

      {query && (filteredProducts.length > 0 || filteredRoutes.length > 0) && (
        <div className="absolute left-0 right-0 bg-white border rounded-md mt-1 shadow-lg z-50 max-h-80 overflow-auto">
      
          {filteredProducts.length > 0 && (
            <div>
              <p className="px-3 py-2 text-xs font-semibold text-gray-500">Products</p>
              {filteredProducts.map((p) => (
                <Link
                  key={p._id}
                  href={`/add-to-cart/${p.slug.current}`}
                  onClick={close}
                  className="block px-3 py-2 hover:bg-gray-100"
                >
                  {p.title}
                </Link>
              ))}
            </div>
          )}

      
          {filteredRoutes.length > 0 && (
            <div>
              <p className="px-3 py-2 text-xs font-semibold text-gray-500">Pages</p>
              {filteredRoutes.map((r) => (
                <Link
                  key={r.path}
                  href={r.path}
                  onClick={close}
                  className="block px-3 py-2 hover:bg-gray-100"
                >
                  {r.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

