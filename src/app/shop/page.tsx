"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import SecondaryHeader from "@/app/components/shared/SecondaryHeader";
import ShopFilter from "@/app/components/sections/ShopFilter";
import ShopButtons from "@/app/components/sections/ShopButtons";
import ProductCard from "@/app/components/cards/ProductCard";
import ServiceBar from "@/app/components/shared/ServiceBar";

import { ProductCardData, fetchProducts } from "@/app/Data";

const ROOM_KEYWORDS: Record<string, string[]> = {
  dining: [
    "dining",
    "table",
    "chair",
    "mug",
    "plate",
    "kitchen",
    "eat",
    "feast",
    "wood",
    "rustic",
    "dinner",
  ],
  living: [
    "living",
    "sofa",
    "couch",
    "lounge",
    "coffee",
    "seater",
    "vase",
    "decor",
    "cushion",
    "modern",
    "comfort",
    "outdoor",
  ],
  bedroom: [
    "bedroom",
    "bed",
    "night",
    "lamp",
    "light",
    "sleep",
    "pillow",
    "wardrobe",
    "cozy",
    "peace",
    "minimalist",
    "mattress",
  ],
};

function ShopCatalog() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState("new");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    const qs = params.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
  };

  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory.trim()) {
      const lowerCat = selectedCategory.trim().toLowerCase();
      const keywords = ROOM_KEYWORDS[lowerCat] || [lowerCat];

      list = list.filter((p) => {
        const haystack =
          `${p.title} ${p.tags} ${p.featured || ""} ${p.description}`.toLowerCase();
        return keywords.some((kw) => haystack.includes(kw));
      });
    }

    switch (sortBy) {
      case "low-price":
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "high-price":
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "new":
        list.reverse();
        break;
      case "old":
        break;
      default:
        list.reverse();
        break;
    }

    return list;
  }, [products, selectedCategory, sortBy]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  return (
    <section className="max-w-[1440px] mx-auto">
      <SecondaryHeader routeName="Shop" />

      <ShopFilter
        productsPerPage={productsPerPage}
        setProductsPerPage={(n) => {
          setProductsPerPage(n);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        setSortBy={(s) => {
          setSortBy(s);
          setCurrentPage(1);
        }}
        totalProducts={filteredAndSortedProducts.length}
        startIndex={indexOfFirstProduct}
        endIndex={indexOfLastProduct}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          Array.from({ length: productsPerPage }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs"
            >
              <div className="bg-gray-200 h-64 sm:h-72 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
                <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="pt-3 flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
                  <div className="h-9 bg-gray-200 rounded-lg w-28 animate-pulse" />
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          <p className="text-center text-red-500 col-span-full py-12">
            {error}
          </p>
        ) : currentProducts.length > 0 ? (
          currentProducts.map((p) => <ProductCard key={p._id} card={p} />)
        ) : (
          <div className="text-center py-16 col-span-full">
            <p className="text-lg font-semibold text-gray-700">
              No products found
              {selectedCategory ? ` for "${selectedCategory}"` : ""}
            </p>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => handleCategoryChange("")}
                className="mt-4 px-5 py-2 rounded-md bg-[#B88E2F] text-white text-sm font-semibold hover:bg-[#9f7924] transition-colors"
              >
                Show All Products
              </button>
            )}
          </div>
        )}
      </div>

      <ShopButtons
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        productsPerPage={productsPerPage}
        totalProducts={filteredAndSortedProducts.length}
      />

      <ServiceBar />
    </section>
  );
}

const Page = () => {
  return (
    <Suspense
      fallback={
        <section className="max-w-[1440px] mx-auto py-16 text-center text-gray-500">
          Loading Shop...
        </section>
      }
    >
      <ShopCatalog />
    </Suspense>
  );
};

export default Page;
