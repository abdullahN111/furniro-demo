"use client";

import { useState } from "react";

// import { LiaSlidersHSolid } from "react-icons/lia";
// import { HiViewGrid } from "react-icons/hi";
// import { LuGalleryVertical } from "react-icons/lu";

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
  // const totalPages = Math.ceil(totalProducts / productsPerPage);

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
    <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between py-5 px-4 lg:px-6 max-w-[1440px] bg-[#F9F1E7] rounded-xl shadow-sm border border-[#f0e4d3] w-full h-auto lg:h-24 gap-4 lg:gap-0 mb-16">
      <div className="flex items-center lg:gap-[26px]">
        {/* <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200">
          <LiaSlidersHSolid className="text-2xl cursor-pointer" />
          <p className="text-lg">Filter</p>
        </div> */}
        {/* <HiViewGrid className="text-2xl cursor-pointer hidden lg:flex" />
        <LuGalleryVertical className="text-2xl cursor-pointer hidden lg:flex" /> */}
        {/* <div className="mx-4 lg:mx-0 h-8 lg:h-10 w-px bg-[#9F9F9F]"></div> */}
        <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
          Showing {productsPerPage} of {totalProducts} products
        </div>
      </div>

      <div className="flex flex-wrap justify-center lg:justify-end items-center gap-4">
        <div className="flex items-center gap-[10px]">
          <label className="text-base lg:text-lg">Show</label>
          <div className="relative w-[90px]">
            <button
              onClick={() => setShowOpen(!showOpen)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between shadow-sm hover:border-[#B88E2F] transition-all"
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
                    className="text-base w-full text-left p-3 hover:bg-[#F9F1E7] transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="flex items-center gap-[10px]">
          <label className="text-base lg:text-lg">Sort by</label>
          <div className="relative w-[120px]">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between shadow-sm hover:border-[#B88E2F] transition-all"
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
                    className="text-base w-full text-left p-3 hover:bg-[#F9F1E7] transition-colors"
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
