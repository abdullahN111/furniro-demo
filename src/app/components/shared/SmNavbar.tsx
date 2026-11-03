"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const SmNavbar = ({ closeMenu }: { closeMenu: () => void }) => {
  const pathname = usePathname();

  return (
    <nav aria-label="Mobile Navigation">
      <ul className="flex flex-col items-center py-4 gap-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href} className="w-full text-center">
              <Link
                href={item.href}
                onClick={closeMenu}
                className={`inline-block py-2 px-6 text-base font-medium rounded-md transition-colors ${
                  isActive
                    ? "text-[#B88E2F] font-semibold bg-[#F9F1E7]"
                    : "text-gray-800 hover:text-[#B88E2F]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SmNavbar;
