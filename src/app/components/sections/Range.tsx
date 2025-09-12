import RangeCard from "@/app/components/cards/RangeCard";
import RangeImage1 from "@/app/public/assets/images/products/RangeImage1.png";
import RangeImage2 from "@/app/public/assets/images/products/RangeImage2.png";
import RangeImage3 from "@/app/public/assets/images/products/RangeImage3.png";

const Range = () => {
  return (
    <section className="max-w-[1140px] mx-auto  my-16">
      <div className="flex flex-col items-center justify-center px-4 gap-1 mb-12 lg:mb-16">
        <h2 className="text-3xl font-bold">Browse The Range</h2>
        <p className="text-xl text-center text-[#666666]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mx-8 lg:mx-12">
        <RangeCard image={RangeImage1} title="Dining" />
        <RangeCard image={RangeImage2} title="Living" />
        <RangeCard image={RangeImage3} title="Bedroom" />
      </div>
    </section>
  );
};

export default Range;
