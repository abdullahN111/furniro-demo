import Link from "next/link";
import { ImCancelCircle } from "react-icons/im";

const SmNavbar = ({ closeMenu }: { closeMenu: () => void }) => {
  return (
    <ul className="flex flex-col items-center  py-4 gap-4">
      <li className="text-xl cursor-pointer" onClick={closeMenu}>
        <ImCancelCircle />
      </li>
      <Link
        href="/"
        className="cursor-pointer hover:shadow-[0_3px_0_rgba(0,0,0,0.2)] transition-shadow"
        onClick={closeMenu}
      >
        <li className="text-base cursor-pointer">Home</li>
      </Link>
      <Link
        href="/shop"
        className="cursor-pointer hover:shadow-[0_3px_0_rgba(0,0,0,0.2)] transition-shadow"
        onClick={closeMenu}
      >
        <li className="text-base cursor-pointer">Shop</li>
      </Link>
      <Link
        href="/about"
        className="cursor-pointer hover:shadow-[0_3px_0_rgba(0,0,0,0.2)] transition-shadow"
        onClick={closeMenu}
      >
        <li className="text-base cursor-pointer">About</li>
      </Link>
      <Link
        href="/contact"
        className="cursor-pointer hover:shadow-[0_3px_0_rgba(0,0,0,0.2)] transition-shadow"
        onClick={closeMenu}
      >
        <li className="text-base cursor-pointer">Contact</li>
      </Link>
    </ul>
  );
};

export default SmNavbar;
