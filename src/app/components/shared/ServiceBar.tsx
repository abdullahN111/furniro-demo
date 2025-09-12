import QualityTrophy from "@/app/components/svgs/QualityTrophy";
import VerifiedWarranty from "@/app/components/svgs/VerifiedWarranty";
import FreeShipping from "@/app/components/svgs/FreeShipping";
import CustomerSupport from "@/app/components/svgs/CustomerSupport";

const ServiceBar = () => {
  return (
    <div className="h-auto lg:h-[270px] bg-[#FAF3EA] py-14 lg:py-0 px-4 lg:px-6 flex flex-col lg:flex-row items-center justify-center gap-20 lg:gap-10 mt-6 mb-16 shadow-md">
      <div className="flex gap-3 items-center">
        <div>
          <QualityTrophy />
        </div>
        <div>
          <h5 className="text-[25px] text-[#242424] font-semibold text-center lg:text-left">
            High Quality
          </h5>
          <p className="text-xl text-[#898989] text-center lg:text-left">
            Crafted from top materials
          </p>
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <div>
          <VerifiedWarranty />
        </div>
        <div>
          <h5 className="text-[25px] text-[#242424] font-semibold text-center lg:text-left">
            Warranty Protection
          </h5>
          <p className="text-xl text-[#898989] text-center lg:text-left">
            Over 2 years
          </p>
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <div>
          <FreeShipping />
        </div>
        <div>
          <h5 className="text-[25px] text-[#242424] font-semibold text-center lg:text-left">
            Free Shipping
          </h5>
          <p className="text-xl text-[#898989] text-center lg:text-left">
            Order over 150 $
          </p>
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <div>
          <CustomerSupport />
        </div>
        <div>
          <h5 className="text-[25px] text-[#242424] font-semibold text-center lg:text-left">
            24 / 7 Support
          </h5>
          <p className="text-xl text-[#898989] text-center lg:text-left">
            Dedicated support
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceBar;
