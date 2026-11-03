"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const LgNavbar = () => {
  const pathname = usePathname();

  return (
    <nav aria-label="Main Navigation" className="hidden lg:block">
      <ul className="flex items-center gap-10 xl:gap-12">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`relative py-2 text-base font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-[#B88E2F] font-semibold after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-[#B88E2F] after:rounded-full"
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

export default LgNavbar;
