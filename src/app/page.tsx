import Hero from "@/app/components/Hero";
import Products from "@/app/components/Products";
import CollectionSetup from "@/app/components/sections/CollectionSetup";

export default function Home() {
  return (
    <main>
      <Hero />
      <Products />
      <CollectionSetup />
    </main>
  );
}
