import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#FFFFFF]  border-t border-gray-300 mx-auto max-w-[1440px] px-9 lg:px-[80px] py-4 pt-12">
      <div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[300px_352px_286px] gap-20 lg:gap-6">
          <div className="flex flex-col gap-[52px] mr-[100px] lg:mr-[120px]">
            <h1 className="font-bold text-2xl">Furniro.</h1>

            <p className="max-w-[290px] text-base text-[#9F9F9F]">
              400 University Drive Suite 200 Coral Gables, FL 33134 USA
            </p>
          </div>
          <div className="flex gap-28">
            <div className="flex flex-col gap-[52px] items-start">
              <h6 className="text-[#9F9F9F] text-base">Links</h6>
              <ul className="flex flex-col gap-[44px]">
                <Link href="/" className="cursor-pointer">
                  <li className="text-base cursor-pointer">Home</li>
                </Link>
                <Link href="/shop" className="cursor-pointer">
                  <li className="text-base cursor-pointer">Shop</li>
                </Link>
                <Link href="/about" className="cursor-pointer">
                  <li className="text-base cursor-pointer">About</li>
                </Link>
                <Link href="/contact" className="cursor-pointer">
                  <li className="text-base cursor-pointer">Contact</li>
                </Link>
              </ul>
            </div>
            <div className="flex flex-col gap-[52px] items-start">
              <h6 className="text-[#9F9F9F] text-base">Help</h6>
              <ul className="flex flex-col gap-[44px]">
                <Link href="/" className="cursor-pointer">
                  <li className="text-base cursor-pointer">Payment Options</li>
                </Link>
                <Link href="/" className="cursor-pointer">
                  <li className="text-base cursor-pointer">Returns</li>
                </Link>
                <Link href="/" className="cursor-pointer">
                  <li className="text-base cursor-pointer">Privacy Polices</li>
                </Link>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-[50px] mr-4">
            <h6 className="text-[#9F9F9F] text-base">Newsletter</h6>
            <div className="flex flex-wrap gap-[10px]">
              <input
                type="text"
                placeholder="Enter Your Email Address"
                className="outline-none border-b-[2px] border-black
"
              />
              <Link href={"/"}>
                <p className="text-sm border-b-[2px] border-black uppercase cursor-pointer">
                  Subscribe
                </p>
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-3 mt-10">
          <div className="w-full h-px bg-gray-300"></div>
        </div>
      </div>
      <div className="h-14 content-center">
        <p className="text-base">2023 Furniro. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
