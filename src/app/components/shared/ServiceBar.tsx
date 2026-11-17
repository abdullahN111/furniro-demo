import QualityTrophy from "@/app/components/svgs/QualityTrophy";
import VerifiedWarranty from "@/app/components/svgs/VerifiedWarranty";
import FreeShipping from "@/app/components/svgs/FreeShipping";
import CustomerSupport from "@/app/components/svgs/CustomerSupport";

const ServiceBar = () => {
  return (
    <div className="w-full max-w-[1440px] mx-auto overflow-hidden h-auto lg:h-[240px] bg-[#FAF3EA] py-10 sm:py-14 lg:py-0 px-4 sm:px-8 lg:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 items-center mt-6 shadow-xs">
      <div className="flex gap-3.5 items-center justify-start sm:justify-center lg:justify-start min-w-0">
        <div className="shrink-0">
          <QualityTrophy />
        </div>
        <div className="min-w-0">
          <h5 className="text-lg sm:text-xl lg:text-[22px] text-[#242424] font-semibold">
            High Quality
          </h5>
          <p className="text-sm sm:text-base text-[#898989]">
            Crafted from top materials
          </p>
        </div>
      </div>

      <div className="flex gap-3.5 items-center justify-start sm:justify-center lg:justify-start min-w-0">
        <div className="shrink-0">
          <VerifiedWarranty />
        </div>
        <div className="min-w-0">
          <h5 className="text-lg sm:text-xl lg:text-[22px] text-[#242424] font-semibold">
            Warranty Protection
          </h5>
          <p className="text-sm sm:text-base text-[#898989]">Over 2 years</p>
        </div>
      </div>

      <div className="flex gap-3.5 items-center justify-start sm:justify-center lg:justify-start min-w-0">
        <div className="shrink-0">
          <FreeShipping />
        </div>
        <div className="min-w-0">
          <h5 className="text-lg sm:text-xl lg:text-[22px] text-[#242424] font-semibold">
            Free Shipping
          </h5>
          <p className="text-sm sm:text-base text-[#898989]">
            Order over $150
          </p>
        </div>
      </div>

      <div className="flex gap-3.5 items-center justify-start sm:justify-center lg:justify-start min-w-0">
        <div className="shrink-0">
          <CustomerSupport />
        </div>
        <div className="min-w-0">
          <h5 className="text-lg sm:text-xl lg:text-[22px] text-[#242424] font-semibold">
            24 / 7 Support
          </h5>
          <p className="text-sm sm:text-base text-[#898989]">
            Dedicated support
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceBar;
