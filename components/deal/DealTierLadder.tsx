import { Check } from "lucide-react";
import type { DealTier } from "@/lib/api/types";
import { formatNumber } from "@/lib/format/number";

/**
 * Bold Mono numbered tier nodes (dir-mono.jsx TierNode).
 * done → green filled with check  |  current → primary filled  |  locked → white with grey border
 */
export function DealTierLadder({
  tiers,
  unitsPledged,
}: {
  tiers: DealTier[];
  unitsPledged: number;
}) {
  const currentIndex = tiers.findIndex((t) => unitsPledged < t.threshold);

  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div
        className="absolute right-[14px] top-1.5 w-0.5 bg-line"
        style={{ bottom: 22 }}
      />

      {tiers.map((tier, i) => {
        const done = unitsPledged >= tier.threshold;
        const isCurrent = i === currentIndex;
        const remaining = tier.threshold - unitsPledged;

        const nodeBg = done ? "#108A52" : isCurrent ? "#FF5A1F" : "#FFFFFF";
        const nodeBorder = done ? "#108A52" : isCurrent ? "#FF5A1F" : "#D4D4D8";
        const nodeColor = done || isCurrent ? "#fff" : "#71717A";

        return (
          <div
            key={tier.level}
            className="relative z-[2] flex gap-3 pb-4"
          >
            {/* Node */}
            <div
              className="flex size-[30px] shrink-0 items-center justify-center rounded-[10px] text-[13px] font-black"
              style={{
                background: nodeBg,
                border: `2px solid ${nodeBorder}`,
                color: nodeColor,
              }}
            >
              {done ? (
                <Check size={15} strokeWidth={2.6} color="#fff" />
              ) : (
                formatNumber(i + 1)
              )}
            </div>

            {/* Label */}
            <div className="flex-1 pt-0.5">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-extrabold ${done || isCurrent ? "text-ink" : "text-mut"}`}
                >
                  {tier.label}
                </span>
                {isCurrent && (
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                    مرحله فعلی
                  </span>
                )}
                {!done && !isCurrent && (
                  <span className="text-[11px] font-semibold text-mut">
                    {formatNumber(remaining)} نفر دیگه
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-[11.5px] text-mut">
                {formatNumber(tier.threshold)} نفر و بیشتر
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
