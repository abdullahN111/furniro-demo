import Link from "next/link";
import ProductList from "../ProductList";

const OurProducts = () => {
  return (
    <section className="max-w-[1440px] mx-auto items-center my-16 flex flex-col justify-center">
      <div className="text-center px-4 mb-2">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#3A3A3A]">
          Our Products
        </h2>
        <p className="text-sm sm:text-base text-gray-500 mt-2">
          Handpicked pieces crafted for everyday living and lasting style
        </p>
      </div>

      <ProductList showProducts={12} />

      <Link
        href="/shop"
        className="border-2 rounded-md border-[#B88E2F] text-[#B88E2F] text-sm sm:text-base font-semibold py-3 px-12 mt-4 hover:text-white hover:bg-[#B88E2F] transition-colors duration-300"
      >
        Discover More
      </Link>
    </section>
  );
};

export default OurProducts;
