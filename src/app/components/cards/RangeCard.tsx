import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

interface RangeCardType {
  image: StaticImageData;
  title: string;
  subtitle?: string;
  href?: string;
}

const RangeCard = ({
  image,
  title,
  subtitle,
  href = "/shop",
}: RangeCardType) => {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center text-center focus:outline-none"
    >
      <div className="relative w-full aspect-[4/5] max-w-[380px] rounded-xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-300 bg-gray-100">
        <Image
          src={image}
          alt={`${title} furniture range`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4">
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white text-gray-900 px-3 py-1.5 rounded-full shadow-md">
            Explore {title} <FiArrowUpRight />
          </span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-[#333333] group-hover:text-[#B88E2F] transition-colors mt-5">
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </Link>
  );
};

export default RangeCard;
