import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { MdWatchLater, MdEmail } from "react-icons/md";

const contactCards = [
  {
    icon: FaLocationDot,
    title: "Showroom & Studio",
    lines: [
      "400 University Drive, Suite 200",
      "Coral Gables, FL 33134, United States",
    ],
  },
  {
    icon: FaPhone,
    title: "Phone & Concierge",
    lines: ["Client Care: +(84) 546-6789", "Trade & Design Hotline: +(84) 456-6789"],
  },
  {
    icon: MdEmail,
    title: "Email Support",
    lines: ["concierge@furniro.com", "returns@furniro.com"],
  },
  {
    icon: MdWatchLater,
    title: "Showroom Hours",
    lines: [
      "Monday – Friday: 9:00 AM – 10:00 PM",
      "Saturday – Sunday: 9:00 AM – 9:00 PM",
    ],
  },
];

const ContactInfo = () => {
  return (
    <div className="bg-[#FCF8F3] border border-[#f0e4d3] rounded-2xl p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Contact Information
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Visit our flagship showroom or reach out directly to our customer care
          team.
        </p>
      </div>

      <div className="space-y-5">
        {contactCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex gap-4 items-start bg-white p-4 rounded-xl border border-[#f0e4d3]/80 shadow-2xs"
            >
              <div className="w-10 h-10 rounded-lg bg-[#F9F1E7] text-[#B88E2F] flex items-center justify-center text-lg shrink-0 mt-0.5">
                <Icon />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {item.title}
                </h3>
                {item.lines.map((line) => (
                  <p key={line} className="text-sm text-gray-600 mt-0.5">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactInfo;
