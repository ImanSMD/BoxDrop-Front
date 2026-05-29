"use client";

import { Sparkles, MapPin, ChevronDown } from "lucide-react";
import { useMe } from "@/lib/hooks/useMe";
import { formatNumber } from "@/lib/format/number";

// Fixed showcase value — replaced with real data from /me/referral once that exists
const TOTAL_SAVINGS = 124500;
const DEAL_COUNT = 23;

export function Header() {
  const { data: me } = useMe();

  return (
    <header className="bg-white px-5 pb-3 pt-2">
      <div className="flex items-center justify-between pb-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-ink">
            <span className="text-[10px] font-black text-primary">B</span>
          </div>
          <span dir="ltr" className="text-[21px] font-black tracking-tight text-ink">
            BoxDrop
          </span>
        </div>
        {/* Zone picker */}
        <button className="flex items-center gap-1 bg-transparent text-[13px] font-bold text-ink">
          <MapPin size={16} strokeWidth={1.9} className="text-primary" />
          {me?.zone?.name ?? "ونک"}
          <ChevronDown size={13} strokeWidth={2} className="text-mut" />
        </button>
      </div>

      {/* Dark savings card */}
      <div className="flex items-center justify-between rounded-[20px] bg-dark px-5 py-[18px]">
        <div>
          <div className="mb-1.5 text-[11.5px] font-semibold text-[#A1A1AA]">
            تا امروز جمع کردی
          </div>
          <div className="text-[30px] font-black leading-none tracking-tight text-white">
            {formatNumber(TOTAL_SAVINGS)}{" "}
            <span className="text-sm font-bold text-[#A1A1AA]">ت</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Sparkles size={26} strokeWidth={1.7} className="text-primary" />
          <span className="text-[10.5px] font-semibold text-[#A1A1AA]">
            {formatNumber(DEAL_COUNT)} دیل
          </span>
        </div>
      </div>
    </header>
  );
}
