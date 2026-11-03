import ProductHeader from "@/app/components/sections/ProductHeader";
import ProductDetail from "@/app/components/sections/ProductDetail";
import ServiceBar from "@/app/components/shared/ServiceBar";

const ProductPage = () => {
  return (
    <section className="max-w-[1440px] mx-auto">
      <ProductHeader />
      <ProductDetail />
      <ServiceBar />
    </section>
  );
};

export default ProductPage;

