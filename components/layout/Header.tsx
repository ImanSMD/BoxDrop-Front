"use client";

import Link from "next/link";
import { MapPin, Wallet } from "lucide-react";
import { useMe } from "@/lib/hooks/useMe";
import { useWallet } from "@/lib/hooks/useWallet";
import { formatMoney } from "@/lib/format/money";

export function Header() {
  const { data: me } = useMe();
  const { data: wallet } = useWallet();

  return (
    <header className="sticky top-0 z-20 bg-card px-5 pb-3 pt-5">
      <div className="flex items-center justify-between">
        <div className="text-xl font-black text-ink">
          <span className="text-primary">Box</span>Drop <span>📦</span>
        </div>
        <button className="flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-sm font-bold text-ink">
          <MapPin className="size-4 text-primary" />
          {me?.zone?.name ?? "منطقه"}
        </button>
      </div>

      <Link
        href="/wallet"
        className="mt-3 flex items-center justify-between rounded-2xl bg-gradient-to-l from-primary to-accent px-4 py-3 text-white"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <Wallet className="size-4" />
          موجودی کیف پول
        </span>
        <span className="text-base font-black">
          {wallet ? formatMoney(wallet.available) : "—"}
        </span>
      </Link>
    </header>
  );
}
