"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Package, Wallet, User } from "lucide-react";

const items = [
  { href: "/profile", label: "پروفایل", icon: User },
  { href: "/wallet", label: "کیف پول", icon: Wallet },
  { href: "/orders", label: "سفارش‌ها", icon: Package },
  { href: "/search", label: "جستجو", icon: Search },
  { href: "/", label: "خانه", icon: Home },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-30 mx-auto flex w-full max-w-md bg-dark pb-6 pt-2.5">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 py-1"
          >
            <Icon
              className={active ? "text-primary" : "text-[#6E6E78]"}
              size={22}
              strokeWidth={active ? 2.2 : 1.8}
            />
            <span
              className={`text-[9.5px] font-bold ${active ? "text-white" : "text-[#6E6E78]"}`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}