"use client";

const ShopButtons = ({
  currentPage,
  setCurrentPage,
  productsPerPage,
  totalProducts,
}: {
  currentPage: number;
  setCurrentPage: (n: number) => void;
  productsPerPage: number;
  totalProducts: number;
}) => {
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const getVisiblePages = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }

    return pages;
  };

  return (
    <div className="py-12 flex sm:flex-row flex-col justify-center items-center gap-[28px]">
      {currentPage > 1 && (
  <button
    onClick={() => setCurrentPage(currentPage - 1)}
    className="text-lg rounded-md py-[10px] px-[18px] bg-[#F9F1E7] hover:bg-[#e9dbb9e7]"
  >
    Prev
  </button>
)}
      <div className="flex gap-[12px] flex-wrap justify-center">
        {getVisiblePages().map((page, i) =>
          page === "..." ? (
            <span key={i} className="px-3 py-2 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => setCurrentPage(page as number)}
              className={`text-lg rounded-md py-[10px] px-[18px] ${
                currentPage === page
                  ? "bg-[#B88E2F] text-white"
                  : "bg-[#F9F1E7] hover:bg-[#e9dbb9e7] text-black"
              }`}
            >
              {page}
            </button>
          ),
        )}
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
