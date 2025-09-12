"use client";

import { LiaSlidersHSolid } from "react-icons/lia";
import { HiViewGrid } from "react-icons/hi";
import { LuGalleryVertical } from "react-icons/lu";

const ShopFilter = ({ showProducts }: { showProducts: number }) => {
  const totalProducts = 24;

  const currentShowProducts = showProducts > 0 ? showProducts : 10;

  const startProduct = Math.max(currentShowProducts - 9, 1);
  const endProduct = Math.min(currentShowProducts, totalProducts);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between py-5 px-4 lg:px-6 max-w-[1440px] bg-[#F9F1E7] w-full h-auto lg:h-24 gap-4 lg:gap-0 mb-16">
      <div className="flex items-center lg:gap-[26px]">
        <div className="flex items-center gap-3">
          <LiaSlidersHSolid className="text-2xl cursor-pointer" />
          <p className="text-lg">Filter</p>
        </div>
        <div>
          <HiViewGrid className="text-2xl cursor-pointer hidden lg:flex" />
        </div>
        <div>
          <LuGalleryVertical className="text-2xl cursor-pointer hidden lg:flex" />
        </div>
        <div className="mx-4 lg:mx-0 h-8 lg:h-10 w-px bg-[#9F9F9F]"></div>
        <div className="text-base">
          Showing {startProduct}–{endProduct} of {totalProducts} results
        </div>
      </div>
      <div className="flex sm:flex-row flex-col items-end sm:items-center gap-4 lg:gap-5">
        <div className="flex items-center gap-[10px]">
          <label className="text-base lg:text-lg">Show</label>
          <input
            type="number"
            placeholder={currentShowProducts.toString()}
            className="text-base lg:text-lg text-[#9F9F9F] focus:outline-none w-[60px] px-2 lg:px-3 h-[44px]"
          />
        </div>
        <div className="flex items-center gap-[10px]">
          <label className="text-base lg:text-lg">Sort by</label>
          <input
            type="text"
            placeholder="Default"
            className="text-base lg:text-lg text-[#9F9F9F] focus:outline-none w-[150px] lg:w-[188px] px-3 lg:px-5 h-[44px]"
          />
        </div>
      </div>
    </div>
  );
};

export default ShopFilter;
