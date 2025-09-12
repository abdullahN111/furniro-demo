"use client";

import { useState } from "react";

import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import ShopFilter from "@/app/components/sections/ShopFilter";
import ShopButtons from "@/app/components/sections/ShopButtons";
import ProductCard from "@/app/components/cards/ProductCard";
import ServiceBar from "@/app/components/shared/ServiceBar";


const Page = () => {
  const [showProducts, setShowProducts] = useState(10);


  return (
    <section className="max-w-[1440px] mx-auto">
      <SecondaryHeader routeName="Shop" />
      <ShopFilter showProducts={showProducts} />
      <ProductCard showProducts={showProducts} />
      <ShopButtons setShowProducts={setShowProducts} showProducts={showProducts} />
      <ServiceBar />
    </section>
  );
};

export default Page;
