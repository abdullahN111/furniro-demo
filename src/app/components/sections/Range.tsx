import RangeCard from "@/app/components/cards/RangeCard";
import RangeImage1 from "@/app/public/assets/images/products/RangeImage1.png";
import RangeImage2 from "@/app/public/assets/images/products/RangeImage2.png";
import RangeImage3 from "@/app/public/assets/images/products/RangeImage3.png";

const ranges = [
  {
    image: RangeImage1,
    title: "Dining",
    subtitle: "Tables, chairs & hosting essentials",
    category: "Dining",
  },
  {
    image: RangeImage2,
    title: "Living",
    subtitle: "Sofas, accent chairs & cozy lounges",
    category: "Living",
  },
  {
    image: RangeImage3,
    title: "Bedroom",
    subtitle: "Beds, nightstands & serene lighting",
    category: "Bedroom",
  },
];

const Range = () => {
  return (
    <section className="max-w-[1440px] mx-auto my-16 px-4 sm:px-8 lg:px-12">
      <div className="flex flex-col items-center justify-center text-center gap-2 mb-12 lg:mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#333333]">
          Browse The Range
        </h2>
        <p className="text-base sm:text-lg text-[#666666] max-w-xl">
          Thoughtfully curated collections designed for every space in your
          home.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
        {ranges.map((item) => (
          <RangeCard
            key={item.title}
            image={item.image}
            title={item.title}
            subtitle={item.subtitle}
            href={`/shop?category=${encodeURIComponent(item.category)}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Range;
