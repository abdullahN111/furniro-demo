import { FaLocationDot } from "react-icons/fa6";
import { FaPhone } from "react-icons/fa6";
import { MdWatchLater } from "react-icons/md";

const ContactInfo = () => {
  return (
    <div className="flex flex-col gap-12 items-center w-auto md:w-[393px]">
      <div className="flex gap-4 md:gap-5 items-start">
        <div className="mt-[5px] text-xl md:text-[22px]">
          <FaLocationDot />
        </div>
        <div>
          <h4 className="text-[22px] md:text-2xl font-semibold">Address</h4>
          <p className="text-[15px] md:text-base w-[212px] mt-[2px]">
            236 5th SE Avenue, New York NY10000, United States
          </p>
        </div>
      </div>
      <div className="flex gap-4 md:gap-5 items-start">
        <div className="mt-[5px] text-xl md:text-[22px]">
          <FaPhone />
        </div>
        <div>
          <h4 className="text-[22px] md:text-2xl font-semibold">Phone</h4>
          <p className="text-[15px] md:text-base w-[212px] mt-[2px]">
            Mobile: +(84) 546-6789
          </p>
          <p className="text-[15px] md:text-base w-[212px]">
            Hotline: +(84) 456-6789
          </p>
        </div>
      </div>
      <div className="flex gap-4 md:gap-5 items-start">
        <div className="mt-[5px] text-[26px] md:text-[28px]">
          <MdWatchLater />
        </div>
        <div>
          <h4 className="text-[22px] md:text-2xl font-semibold">
            Working Time
          </h4>
          <p className="text-[15px] md:text-base w-[212px] mt-[2px]">
            Monday-Friday: 9:00 - 22:00
          </p>
          <p className="text-[15px] md:text-base w-[212px]">
            Saturday-Sunday: 9:00 - 21:00
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
