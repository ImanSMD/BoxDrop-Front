"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Package, User } from "lucide-react";

const items = [
  { href: "/", label: "خانه", icon: Home },
  { href: "/search", label: "جستجو", icon: Search },
  { href: "/orders", label: "سفارش‌ها", icon: Package },
  { href: "/profile", label: "پروفایل", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-30 mx-auto flex w-full max-w-md border-t border-border bg-card pb-6 pt-2">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 py-1"
          >
            <Icon
              className={`size-6 ${active ? "text-primary" : "text-muted-foreground"}`}
              strokeWidth={active ? 2.5 : 2}
            />
            <span
              className={`text-[10px] font-bold ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
