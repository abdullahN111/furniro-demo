import ProductHeader from "@/app/components/sections/ProductHeader";
import ProductDetail from "@/app/components/sections/ProductDetail";

const ProductCart = () => {
  return (
    <section className="max-w-[1440px] mx-auto">
      <ProductHeader />
      <ProductDetail />
    </section>
  );
};

export default ProductCart;
