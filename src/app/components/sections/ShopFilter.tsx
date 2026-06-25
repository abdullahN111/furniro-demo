"use client";

import { useState } from "react";


const ShopFilter = ({
  productsPerPage,
  setProductsPerPage,
  sortBy,
  setSortBy,
  totalProducts,
}: {
  productsPerPage: number;
  setProductsPerPage: (n: number) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  totalProducts: number;
}) => {


  const [sortOpen, setSortOpen] = useState(false);
  const [showOpen, setShowOpen] = useState(false);

  const sortOptions = [
    { value: "new", label: "New" },
    { value: "old", label: "Old" },
    { value: "low-price", label: "Low Price" },
    { value: "high-price", label: "High Price" },
  ];

  const showOptions = [
    { value: 8, label: "8" },
    { value: 12, label: "12" },
    { value: 16, label: "16" },
    { value: 24, label: "24" },
  ];



  return (
    <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between p-4 max-w-[1440px] bg-[#F9F1E7] shadow-sm border border-[#f0e4d3] w-full h-auto lg:h-24 gap-4 lg:gap-0 mb-16">
      <div className="flex items-center lg:gap-5">

        <div className="text-base text-gray-600 px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm">
          Showing {productsPerPage} of {totalProducts} products
        </div>
      </div>

      <div className="flex flex-wrap justify-center lg:justify-end items-center gap-6">
        <div className="flex items-center gap-3">
          <label className="text-base">Show</label>
          <div className="relative w-[90px]">
            <button
              onClick={() => setShowOpen(!showOpen)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between shadow-sm hover:border-[#B88E2F] transition-all"
            >
              <span>
                {showOptions.find((o) => o.value === productsPerPage)?.label}
              </span>
              <span
                className={`transition-transform duration-500 ${showOpen ? "rotate-180" : ""
                  }`}
              >
                ▼
              </span>
            </button>

            {showOpen && (
              <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95">
                {showOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setProductsPerPage(option.value);
                      setShowOpen(false);
                    }}
                    className="text-[15px] w-full text-left px-3 py-2 hover:bg-[#F9F1E7] transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="flex items-center gap-3">
          <label className="text-base">Sort by</label>
          <div className="relative w-[150px]">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between shadow-sm hover:border-[#B88E2F] transition-all"
            >
              <span>
                {sortOptions.find((o) => o.value === sortBy)?.label}
              </span>
              <span
                className={`transition-transform duration-500 ${sortOpen ? "rotate-180" : ""
                  }`}
              >
                ▼
              </span>
            </button>

            {sortOpen && (
              <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setSortOpen(false);
                    }}
                    className="text-[15px] w-full text-left px-3 py-2 hover:bg-[#F9F1E7] transition-colors"
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
  );
};

export default ShopFilter;
