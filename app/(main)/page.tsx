"use client";

import { useState } from "react";
import { Flame } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { DealCard } from "@/components/deal/DealCard";
import { DealCardSkeleton } from "@/components/deal/DealCardSkeleton";
import { DealProgress } from "@/components/deal/DealProgress";
import { useDeals } from "@/lib/hooks/useDeals";
import { useCategories } from "@/lib/hooks/useCatalog";
import { useUiStore } from "@/lib/store/ui";
import { formatNumber } from "@/lib/format/number";
import { formatMoney } from "@/lib/format/money";
import type { DealSort } from "@/lib/api/types";

const SORTS: { value: DealSort; label: string }[] = [
  { value: "ending_soon", label: "رو به اتمام" },
  { value: "popular", label: "محبوب‌ترین" },
  { value: "savings", label: "بیشترین سود" },
];

export default function HomePage() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<DealSort>("ending_soon");
  const { data: categories } = useCategories();
  const deals = useDeals({ category, sort, status: "open" });
  const openJoin = useUiStore((s) => s.openJoin);

  const cats = ["همه", ...(categories?.map((c) => c.name) ?? [])];
  const catIds = [undefined, ...(categories?.map((c) => c.id) ?? [])];
  const activeCatIdx = catIds.indexOf(category) === -1 ? 0 : catIds.indexOf(category);

  const allDeals = deals.data?.results ?? [];
  const featured = allDeals[0];
  const listDeals = allDeals.slice(1);

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      {/* Category tabs — underline style */}
      <div>
        <div className="no-scrollbar flex gap-[18px] overflow-x-auto px-5 pt-3.5">
          {cats.map((c, i) => (
            <button
              key={i}
              onClick={() => setCategory(catIds[i])}
              className={`shrink-0 pb-1.5 text-[13.5px] transition-colors ${
                i === activeCatIdx
                  ? "border-b-[2.5px] border-primary font-extrabold text-ink"
                  : "border-b-[2.5px] border-transparent font-semibold text-mut"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="h-px bg-line" />
      </div>

      <div className="flex-1 px-[18px] pb-6">
        {/* Sort row */}
        <div className="flex items-center justify-between py-3">
          <h2 className="text-base font-black text-ink">همه دیل‌های فعال</h2>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as DealSort)}
            className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-ink outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {deals.isLoading && (
          <div className="space-y-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <DealCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {deals.isError && (
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <span className="text-4xl">😕</span>
            <p className="text-sm text-mut">خطا در دریافت دیل‌ها.</p>
            <button
              onClick={() => deals.refetch()}
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white"
            >
              تلاش دوباره
            </button>
          </div>
        )}

        {/* Empty */}
        {deals.isSuccess && allDeals.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🪹</span>
            <p className="text-sm text-mut">هنوز دیلی در منطقه شما نیست</p>
          </div>
        )}

        {/* Featured hero card */}
        {featured && (
          <div
            className="relative mb-4 cursor-pointer overflow-hidden rounded-[20px]"
            style={{ height: 218 }}
            onClick={() => (window.location.href = `/deals/${featured.id}`)}
          >
            {/* Background */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#EDEDEF] text-7xl">
              {featured.product.emoji}
            </div>
            {/* Heat badge */}
            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-extrabold text-white">
              <Flame size={13} strokeWidth={2.2} />
              {heatLabel(featured.units_pledged, featured.box_size)}
            </div>
            {/* Bottom overlay */}
            <div
              className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-3.5"
              style={{
                background: "rgba(17,17,20,.82)",
                backdropFilter: "blur(2px)",
              }}
            >
              <div className="text-[17px] font-black text-white">
                {featured.product.name}
              </div>
              <div className="my-2.5 flex items-center gap-2">
                <div className="flex-1">
                  <DealProgress
                    unitsPledged={featured.units_pledged}
                    boxSize={featured.box_size}
                    tier={featured.tier}
                    light
                  />
                </div>
                <span
                  className="text-[11.5px] font-extrabold text-white"
                  dir="ltr"
                >
                  {formatNumber(featured.units_pledged)}/
                  {formatNumber(featured.box_size)}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-[20px] font-black text-primary">
                    {formatNumber(featured.wholesale_price)}{" "}
                    <span className="text-xs text-white">ت</span>
                  </span>
                  <span className="text-xs text-[#9A9AA2] line-through">
                    {formatMoney(featured.retail_reference)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openJoin(featured.id);
                  }}
                  className="flex items-center gap-1.5 rounded-[11px] bg-primary px-4 py-2.5 text-[12.5px] font-extrabold text-white"
                >
                  پیوستن ›
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List rows */}
        {listDeals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}

function heatLabel(filled: number, box: number) {
  const r = filled / box;
  if (filled >= box) return "جعبه پر شد";
  if (r >= 0.75) return "داغ شد";
  if (r >= 0.4) return "در حال گرم شدن";
  return "تازه باز شده";
}
