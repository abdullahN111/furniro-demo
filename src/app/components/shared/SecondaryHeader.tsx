import Image from "next/image";
import ShopMainImage from "@/app/public/assets/images/main/ShopMainImage.png";
import { IoIosArrowForward } from "react-icons/io";

interface SecondaryHeaderProps {
  routeName: string;
}

const SecondaryHeader = ({ routeName }: SecondaryHeaderProps) => {
  return (
    <div className="relative w-full h-[316px]">
      <Image
        src={ShopMainImage}
        alt="Decorative Room"
        fill
        objectFit="cover"
        priority
        className="opacity-80 md:opacity-100"
      />

      <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
        <h1 className="text-[42px] md:text-[46px] ">{routeName}</h1>
        <div className="flex gap-[6px] items-center ">
          <p className="text-base font-normal">Home</p>
          <IoIosArrowForward className="font-normal" />
          <p className="text-base font-extralight mt-[2px] text-gray-700">
            {routeName}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecondaryHeader;
