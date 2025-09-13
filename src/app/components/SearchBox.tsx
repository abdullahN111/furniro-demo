"use client";

import { useState, useEffect, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { fetchProducts, ProductCardData } from "@/app/Data";
import { staticRoutes } from "@/app/Data/index";
import Link from "next/link";

export default function SearchBox({ close }: { close?: () => void }) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductCardData[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<typeof staticRoutes>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts().then(setProducts);
  
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setIsOpen(true);
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
      p.tags.toLowerCase().includes(lower) ||
      p.featured.toLowerCase().includes(lower)
    );

    const routes = staticRoutes.filter((r) =>
      r.title.toLowerCase().includes(lower)
    );

    setFilteredProducts(prod.slice(0, 5));
    setFilteredRoutes(routes);
  }, [query, products]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      if (close) close();
    }, 300); 
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className={`bg-white w-full max-w-2xl mt-20 mx-6 sm:mx-10 rounded-lg shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : '-translate-y-10'}`}
        onClick={(e) => e.stopPropagation()}
      >
   
        <div className="flex items-center border-b border-gray-200 p-3 md:p-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products or pages..."
              className="block w-full pl-10 pr-4 py-[10px] md:py-3 border-0 focus:ring-0 text-base sm:text-[17px] md:text-lg outline-none"
              autoFocus
            />
          </div>
          <button
            onClick={handleClose}
            className="ml-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiX className="h-5 md:h-6 w-5 md:w-6 text-gray-500" />
          </button>
        </div>

       
        <div className="max-h-96 overflow-y-auto">
          {query && filteredProducts.length === 0 && filteredRoutes.length === 0 ? (
            <div className="p-5 md:p-6 text-center text-gray-500">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <>
              {filteredProducts.length > 0 && (
                <div>
                  <p className="px-5 md:px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-50 uppercase tracking-wide">
                    Products
                  </p>
                  {filteredProducts.map((p) => (
                    <Link
                      key={p._id}
                      href={`/add-to-cart/${p.slug.current}`}
                      onClick={handleClose}
                      className="flex items-center px-5 md:px-6 py-3 md:py-4 hover:bg-gray-50 border-b border-gray-100 transition-colors text-lg"
                    >
                      <span className="text-gray-800">{p.title}</span>
                    </Link>
                  ))}
                </div>
              )}

              {filteredRoutes.length > 0 && (
                <div>
                  <p className="px-5 md:px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-50 uppercase tracking-wide">
                    Pages
                  </p>
                  {filteredRoutes.map((r) => (
                    <Link
                      key={r.path}
                      href={r.path}
                      onClick={handleClose}
                      className="flex items-center px-5 md:px-6 py-3 md:py-4 hover:bg-gray-50 border-b border-gray-100 transition-colors text-lg"
                    >
                      <span className="text-gray-800">{r.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

     
        {query && (
          <div className="px-5 md:px-6 py-3 bg-gray-50 text-sm text-gray-500 rounded-b-lg">
            {filteredProducts.length + filteredRoutes.length} results found
          </div>
        )}
      </div>
    </div>
  );
}