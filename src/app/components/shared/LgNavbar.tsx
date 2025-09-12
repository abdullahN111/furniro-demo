import Link from "next/link";

const LgNavbar = () => {
  return (
    <ul className="hidden lg:flex gap-12">
      <Link
        href="/"
        className="cursor-pointer hover:shadow-[0_3px_0_rgba(0,0,0,0.2)] transition-shadow"
      >
        <li className="text-base">Home</li>
      </Link>
      <Link
        href="/shop"
        className="cursor-pointer hover:shadow-[0_3px_0_rgba(0,0,0,0.2)] transition-shadow"
      >
        <li className="text-base">Shop</li>
      </Link>
      <Link
        href="/about"
        className="cursor-pointer hover:shadow-[0_3px_0_rgba(0,0,0,0.2)] transition-shadow"
      >
        <li className="text-base">About</li>
      </Link>
      <Link
        href="/contact"
        className="cursor-pointer hover:shadow-[0_3px_0_rgba(0,0,0,0.2)] transition-shadow"
      >
        <li className="text-base">Contact</li>
      </Link>
    </ul>
  );
};

export default LgNavbar;
