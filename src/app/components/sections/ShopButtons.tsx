"use client";

const ShopButtons = ({
  currentPage,
  setCurrentPage,
  productsPerPage,
}: {
  currentPage: number;
  setCurrentPage: (n: number) => void;
  productsPerPage: number;
}) => {
  const totalProducts = 24; 
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  return (
    <div className="py-12 flex sm:flex-row flex-col justify-center items-center gap-[28px]">
      <div className="flex gap-[12px] flex-wrap">
        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`text-lg rounded-md py-[10px] px-[18px] ${
                currentPage === page
                  ? "bg-[#B88E2F] text-white"
                  : "bg-[#F9F1E7] hover:bg-[#e9dbb9e7] text-black"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>
      {currentPage < totalPages && (
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          className="text-lg rounded-md py-[10px] px-[18px] bg-[#F9F1E7] hover:bg-[#e9dbb9e7] text-black"
        >
          Next
        </button>
      )}
    </div>
  );
};

export default ShopButtons;
