import Image, { StaticImageData } from "next/image";

interface RangeCardType {
  image: StaticImageData;
  title: string;
}

const RangeCard = ({ image, title }: RangeCardType) => {
  return (
    <div className="flex flex-col gap-6 items-center">
      <Image
        src={image}
        width={350}
        alt="Home Decor"
        className="transition-transform duration-300 hover:scale-105 cursor-pointer"
      />
      <h5 className="text-xl font-bold  text-[#333333]">{title}</h5>
    </div>
  );
};

export default RangeCard;
