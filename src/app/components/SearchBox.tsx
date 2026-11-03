"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FiSearch, FiX, FiArrowRight } from "react-icons/fi";
import { fetchProducts, ProductCardData, staticRoutes } from "@/app/Data/index";
import Image from "next/image";
import Link from "next/link";

let cachedProducts: ProductCardData[] | null = null;

export default function SearchBox({ close }: { close?: () => void }) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductCardData[]>(
    cachedProducts || []
  );
  const [loading, setLoading] = useState(!cachedProducts);
  const [filteredProducts, setFilteredProducts] = useState<ProductCardData[]>(
    []
  );
  const [filteredRoutes, setFilteredRoutes] = useState<typeof staticRoutes>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      if (close) close();
    }, 200);
  }, [close]);

  useEffect(() => {
    setIsOpen(true);
    inputRef.current?.focus();

    if (!cachedProducts) {
      setLoading(true);
      fetchProducts()
        .then((data) => {
          cachedProducts = data;
          setProducts(data);
        })
        .catch((err) => console.error("Search fetch failed:", err))
        .finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose]);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredProducts([]);
      setFilteredRoutes([]);
      return;
    }

    const lower = query.toLowerCase();

    const prod = products.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.tags.toLowerCase().includes(lower) ||
        (p.featured && p.featured.toLowerCase().includes(lower)) ||
        p.description.toLowerCase().includes(lower)
    );

    const routes = staticRoutes.filter((r) =>
      r.title.toLowerCase().includes(lower)
    );

    setFilteredProducts(prod.slice(0, 6));
    setFilteredRoutes(routes);
  }, [query, products]);

  const quickTags = ["Sofa", "Dining", "Living", "Bedroom", "Lamp", "Chair"];

  return (
    <div
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search products and pages"
      className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-[2000] flex justify-center items-start pt-16 sm:pt-24 px-4 transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-200 ${
          isOpen ? "translate-y-0 scale-100" : "-translate-y-4 scale-95"
        }`}
      >
        <div className="flex items-center border-b border-gray-100 px-4 py-3.5">
          <FiSearch className="h-5 w-5 text-[#B88E2F] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search furniture, room styles, or pages..."
            className="block w-full py-1 text-base sm:text-lg text-gray-800 placeholder-gray-400 outline-none bg-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 mr-1"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close search"
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto">
          {!query.trim() ? (
            <div className="p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="px-3.5 py-1.5 rounded-full text-sm bg-[#F9F1E7] text-gray-700 hover:bg-[#B88E2F] hover:text-white transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Searching catalog...
            </div>
          ) : filteredProducts.length === 0 && filteredRoutes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 font-medium">
                No matches found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Try searching by furniture type, tag, or room category.
              </p>
            </div>
          ) : (
            <div>
              {filteredProducts.length > 0 && (
                <div>
                  <p className="px-5 py-2.5 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wider">
                    Products
                  </p>
                  <div className="divide-y divide-gray-100">
                    {filteredProducts.map((p) => (
                      <Link
                        key={p._id}
                        href={`/product/${p.slug.current}`}
                        onClick={handleClose}
                        className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-[#FCF8F3] transition-colors group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 shrink-0">
                            <Image
                              src={p.image}
                              alt={p.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-[#B88E2F] transition-colors truncate">
                              {p.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {p.featured || p.tags}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm sm:text-base font-bold text-[#B88E2F]">
                            ${Number(p.price).toFixed(2)}
                          </span>
                          {p.oldPrice && (
                            <span className="block text-xs text-gray-400 line-through">
                              ${p.oldPrice}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {filteredRoutes.length > 0 && (
                <div>
                  <p className="px-5 py-2.5 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wider">
                    Pages
                  </p>
                  <div className="divide-y divide-gray-100">
                    {filteredRoutes.map((r) => (
                      <Link
                        key={r.path}
                        href={r.path}
                        onClick={handleClose}
                        className="flex items-center justify-between px-5 py-3 hover:bg-[#FCF8F3] transition-colors text-sm sm:text-base font-medium text-gray-700 hover:text-[#B88E2F]"
                      >
                        <span>{r.title}</span>
                        <FiArrowRight className="text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {query.trim() && (
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <span>
              Showing {filteredProducts.length + filteredRoutes.length} result
              {filteredProducts.length + filteredRoutes.length === 1 ? "" : "s"}
            </span>
            <Link
              href={`/shop?category=${encodeURIComponent(query.trim())}`}
              onClick={handleClose}
              className="font-semibold text-[#B88E2F] hover:underline flex items-center gap-1"
            >
              Browse in Shop <FiArrowRight />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
