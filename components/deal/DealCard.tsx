"use client";

import { useRouter } from "next/navigation";
import type { Deal } from "@/lib/api/types";
import { DealProgress } from "./DealProgress";
import { formatNumber } from "@/lib/format/number";
import { useUiStore } from "@/lib/store/ui";

const ZONE_DOT: Record<string, string> = {
  vanak: "#7C5CFF",
  ponak: "#0E9FD8",
  niavaran: "#0FA968",
  saadatabad: "#E8902B",
  jordan: "#E0533A",
};

/**
 * Bold Mono list-row layout (dir-mono.jsx ListRow).
 * Photo slot 62×62, thin progress bar, price right-aligned.
 */
export function DealCard({ deal }: { deal: Deal }) {
  const router = useRouter();
  const openJoin = useUiStore((s) => s.openJoin);
  const zoneColor = deal.zone ? (ZONE_DOT[deal.zone.id] ?? "#A1A1AA") : "#A1A1AA";

  return (
    <div
      onClick={() => router.push(`/deals/${deal.id}`)}
      className="flex cursor-pointer items-center gap-3 border-b border-line py-4"
    >
      {/* Photo slot */}
      <div
        className="flex shrink-0 items-center justify-center rounded-[15px] bg-[#EDEDEF] text-3xl"
        style={{ width: 62, height: 62 }}
      >
        {deal.product.emoji}
      </div>

      {/* Middle */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14.5px] font-extrabold leading-snug text-ink">
          {deal.product.name}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-mut">
          {deal.zone && (
            <>
              <span
                className="inline-block size-[6px] rounded-full"
                style={{ background: zoneColor }}
              />
              <span>{deal.zone.name}</span>
              <span className="text-line">•</span>
            </>
          )}
          <span>جعبه {formatNumber(deal.box_size)}‌تایی</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1">
            <DealProgress
              unitsPledged={deal.units_pledged}
              boxSize={deal.box_size}
              tier={deal.tier}
            />
          </div>
          <span className="text-[11px] font-extrabold text-ink" dir="ltr">
            {formatNumber(deal.units_pledged)}/{formatNumber(deal.box_size)}
          </span>
        </div>
      </div>

      {/* Price + savings */}
      <div
        className="flex shrink-0 flex-col items-start gap-0.5"
        onClick={(e) => {
          e.stopPropagation();
          openJoin(deal.id);
        }}
      >
        <div className="text-[16px] font-black leading-none tracking-tight text-ink">
          {formatNumber(deal.wholesale_price)}
        </div>
        <div className="text-[10px] text-[#BFBFC6] line-through">
          {formatNumber(deal.retail_reference)}
        </div>
        <span className="mt-0.5 text-[10px] font-extrabold text-primary">
          ٪{formatNumber(deal.savings_percent)}−
        </span>
      </div>
    </div>
  );
}
