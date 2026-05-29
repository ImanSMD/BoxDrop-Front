"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { DealCard } from "@/components/deal/DealCard";
import { DealCardSkeleton } from "@/components/deal/DealCardSkeleton";
import { useDeals } from "@/lib/hooks/useDeals";
import { useCategories } from "@/lib/hooks/useCatalog";
import type { DealSort } from "@/lib/api/types";

const SORTS: { value: DealSort; label: string }[] = [
  { value: "ending_soon", label: "رو به اتمام" },
  { value: "popular", label: "محبوب" },
  { value: "savings", label: "بیشترین سود" },
];

export default function HomePage() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<DealSort>("ending_soon");

  const { data: categories } = useCategories();
  const deals = useDeals({ category, sort, status: "open" });

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      {/* Category pills */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-2">
        <Pill active={!category} onClick={() => setCategory(undefined)}>
          همه 🏷️
        </Pill>
        {categories?.map((c) => (
          <Pill
            key={c.id}
            active={category === c.id}
            onClick={() => setCategory(c.id)}
          >
            {c.emoji} {c.name}
          </Pill>
        ))}
      </div>

      {/* Section header + sort */}
      <div className="flex items-center justify-between px-5 pb-2 pt-1">
        <h2 className="font-black text-ink">🔥 دیل‌های باز</h2>
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

      {/* List */}
      <div className="flex-1 space-y-3 px-5 pb-6">
        {deals.isLoading &&
          Array.from({ length: 4 }).map((_, i) => <DealCardSkeleton key={i} />)}

        {deals.isError && (
          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <span className="text-4xl">😕</span>
            <p className="text-sm text-muted-foreground">
              خطا در دریافت دیل‌ها.
            </p>
            <button
              onClick={() => deals.refetch()}
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
            >
              تلاش دوباره
            </button>
          </div>
        )}

        {deals.isSuccess && deals.data.results.length === 0 && (
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🪹</span>
            <p className="text-sm text-muted-foreground">
              هنوز دیلی در منطقه شما نیست
            </p>
          </div>
        )}

        {deals.isSuccess &&
          deals.data.results.map((deal) => <DealCard key={deal.id} deal={deal} />)}
      </div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-surface text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}
