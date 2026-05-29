"use client";

import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { DealCard } from "@/components/deal/DealCard";
import { DealCardSkeleton } from "@/components/deal/DealCardSkeleton";
import { useDeals } from "@/lib/hooks/useDeals";

// Phase 1: client-side filter over the open deals (full search is Phase 2, §10).
export default function SearchPage() {
  const [query, setQuery] = useState("");
  const deals = useDeals({ status: "open" });

  const results = useMemo(() => {
    const list = deals.data?.results ?? [];
    const q = query.trim();
    if (!q) return list;
    return list.filter(
      (d) =>
        d.product.name.includes(q) || d.product.category.name.includes(q),
    );
  }, [deals.data, query]);

  return (
    <div className="flex flex-1 flex-col px-5 pt-6">
      <h1 className="mb-3 text-xl font-black text-ink">جستجو</h1>
      <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
        <SearchIcon className="size-5 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="نام محصول یا دسته…"
          className="flex-1 bg-transparent text-base outline-none"
        />
      </div>

      <div className="mt-4 flex-1 space-y-3 pb-6">
        {deals.isLoading &&
          Array.from({ length: 3 }).map((_, i) => <DealCardSkeleton key={i} />)}

        {deals.isSuccess && results.length === 0 && (
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🔍</span>
            <p className="text-sm text-muted-foreground">نتیجه‌ای پیدا نشد</p>
          </div>
        )}

        {results.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}
