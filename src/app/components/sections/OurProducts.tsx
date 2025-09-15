import Link from "next/link";
import ProductList from "../ProductList";

const OurProducts = () => {

  return (
    <section className="max-w-[1440px] mx-auto  items-center my-16 flex flex-col justify-center">
      <h2 className="text-4xl font-bold text-[#3A3A3A] text-center">
        Our Products
      </h2>
     <ProductList showProducts={12} />
    
        <Link href="/shop">
          <button className="border mx-auto rounded-sm border-[#B88E2F] text-[#B88E2F] text-base font-semibold py-2 px-10 mt-8 sm:mt-4 md:mt-2 hover:text-white hover:bg-[#B88E2F] transition duration-300 py">
            Discover More
          </button>
        </Link>
    
    </section>
  );
};

export default OurProducts;
