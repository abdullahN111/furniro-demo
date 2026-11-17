"use client";

import { useState, useEffect, useRef } from "react";
import { FiX, FiSliders, FiCamera } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import VisualSearchModal from "@ai/components/VisualSearchModal";

const ShopFilter = ({
  productsPerPage,
  setProductsPerPage,
  sortBy,
  setSortBy,
  totalProducts,
  startIndex = 0,
  endIndex = 0,
  selectedCategory = "",
  onSelectCategory,
}: {
  productsPerPage: number;
  setProductsPerPage: (n: number) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  totalProducts: number;
  startIndex?: number;
  endIndex?: number;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}) => {
  const [sortOpen, setSortOpen] = useState(false);
  const [showOpen, setShowOpen] = useState(false);
  const [visualSearchOpen, setVisualSearchOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { value: "new", label: "Newest" },
    { value: "old", label: "Oldest" },
    { value: "low-price", label: "Price: Low to High" },
    { value: "high-price", label: "Price: High to Low" },
  ];

  const showOptions = [
    { value: 8, label: "8" },
    { value: 12, label: "12" },
    { value: 16, label: "16" },
    { value: 24, label: "24" },
  ];

  const categories = ["All", "Dining", "Living", "Bedroom"];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setSortOpen(false);
        setShowOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayStart = totalProducts === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(endIndex, totalProducts);

  return (
    <>
      <div
        ref={filterRef}
        className="flex flex-col gap-3.5 px-4 sm:px-8 lg:px-12 py-4 sm:py-5 max-w-[1440px] bg-[#F9F1E7] shadow-xs border-y border-[#f0e4d3] w-full mb-8 sm:mb-10"
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 lg:gap-4">
          {/* Left: Category Pills & Result Summary */}
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-3">
            {onSelectCategory && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pr-0 lg:pr-2 lg:border-r lg:border-[#e2d3be]">
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-700 mr-0.5">
                  <FiSliders className="text-[#B88E2F]" />
                  Room:
                </span>
                {categories.map((cat) => {
                  const value = cat === "All" ? "" : cat;
                  const isActive =
                    selectedCategory.toLowerCase() === value.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => onSelectCategory(value)}
                      className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-[#B88E2F] text-white shadow-xs"
                          : "bg-white text-gray-700 hover:bg-[#fff9f0] border border-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}

                {selectedCategory &&
                  !categories.some(
                    (c) => c.toLowerCase() === selectedCategory.toLowerCase()
                  ) && (
                    <button
                      type="button"
                      onClick={() => onSelectCategory("")}
                      className="inline-flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-[#B88E2F] text-white shadow-xs"
                    >
                      <span>&ldquo;{selectedCategory}&rdquo;</span>
                      <FiX />
                    </button>
                  )}
              </div>
            )}

            <div className="text-xs sm:text-sm text-gray-600 px-3 py-1.5 rounded-lg bg-white/80 border border-gray-200">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {displayStart}&ndash;{displayEnd}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {totalProducts}
              </span>{" "}
              results
            </div>
          </div>

          {/* Right: AI Visual Search, Show & Sort Controls */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 sm:gap-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#eadbc6]">
            <button
              type="button"
              onClick={() => setVisualSearchOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-3.5 sm:px-4 rounded-full bg-[#B88E2F] hover:bg-[#9f7924] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <FiCamera className="text-xs sm:text-sm text-[#FFF3E3]" />
              <span>Visual Search</span>
              <HiSparkles className="text-xs text-[#FFF3E3]" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700">
                  Show
                </label>
                <div className="relative w-[68px] sm:w-[80px]">
                  <button
                    type="button"
                    onClick={() => {
                      setSortOpen(false);
                      setShowOpen((prev) => !prev);
                    }}
                    className="w-full h-9 sm:h-10 px-2.5 sm:px-3 rounded-lg border border-gray-200 bg-white flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-800 shadow-2xs hover:border-[#B88E2F] transition-all"
                  >
                    <span>
                      {
                        showOptions.find((o) => o.value === productsPerPage)
                          ?.label
                      }
                    </span>
                    <span
                      className={`text-[10px] text-gray-400 transition-transform duration-200 ${
                        showOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {showOpen && (
                    <div className="absolute top-10 sm:top-11 left-0 w-full bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50">
                      {showOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setProductsPerPage(option.value);
                            setShowOpen(false);
                          }}
                          className={`text-xs sm:text-sm w-full text-left px-3 py-2 transition-colors ${
                            option.value === productsPerPage
                              ? "bg-[#F9F1E7] font-semibold text-[#B88E2F]"
                              : "hover:bg-[#F9F1E7] text-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 hidden xsx:inline">
                  Sort
                </label>
                <div className="relative w-[145px] sm:w-[175px]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOpen(false);
                      setSortOpen((prev) => !prev);
                    }}
                    className="w-full h-9 sm:h-10 px-2.5 sm:px-3 rounded-lg border border-gray-200 bg-white flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-800 shadow-2xs hover:border-[#B88E2F] transition-all"
                  >
                    <span className="truncate">
                      {sortOptions.find((o) => o.value === sortBy)?.label}
                    </span>
                    <span
                      className={`text-[10px] text-gray-400 transition-transform duration-200 ${
                        sortOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {sortOpen && (
                    <div className="absolute top-10 sm:top-11 right-0 w-full bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSortBy(option.value);
                            setSortOpen(false);
                          }}
                          className={`text-xs sm:text-sm w-full text-left px-3 py-2 transition-colors ${
                            option.value === sortBy
                              ? "bg-[#F9F1E7] font-semibold text-[#B88E2F]"
                              : "hover:bg-[#F9F1E7] text-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VisualSearchModal
        isOpen={visualSearchOpen}
        onClose={() => setVisualSearchOpen(false)}
      />
    </>
  );
};

export default ShopFilter;
