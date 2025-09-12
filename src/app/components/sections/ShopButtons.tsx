"use client";

import { Dispatch, SetStateAction } from "react";

const ShopButtons = ({
  showProducts,
  setShowProducts,
}: {
  showProducts: number;
  setShowProducts: Dispatch<SetStateAction<number>>;
}) => {
 
  const currentPage = Math.ceil(showProducts / 10);

  const handleShowMore = () => {
    if (showProducts < 24) {
      setShowProducts((prevProd) => prevProd + 10); 
    }
  };

  return (
    <div className="py-12 flex sm:flex-row flex-col justify-center items-center gap-[28px]">
      <div className="flex gap-[24px] sm:gap-[28px]">
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            onClick={() => setShowProducts(10 * page)} 
            className={`text-lg rounded-md py-[10px] px-[18px] ${
              currentPage === page
                ? "bg-[#B88E2F] text-white"
                : "bg-[#F9F1E7] hover:bg-[#e9dbb9e7] text-black"
            } cursor-pointer`}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        onClick={handleShowMore}
        className="text-lg rounded-md py-[10px] px-[18px] bg-[#F9F1E7] hover:bg-[#e9dbb9e7] text-black cursor-pointer"
        
      >
        Next
      </button>
    </div>
  );
};

export default ShopButtons;
