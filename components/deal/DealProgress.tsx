import type { TierLevel } from "@/lib/api/types";
import { formatNumber } from "@/lib/format/number";

type DealProgressProps = {
  unitsPledged: number;
  boxSize: number;
  tier: TierLevel;
  /** Show the text label above the bar */
  showLabel?: boolean;
  /** Light variant — white track for dark backgrounds */
  light?: boolean;
};

export function DealProgress({
  unitsPledged,
  boxSize,
  tier: _tier,
  showLabel = false,
  light = false,
}: DealProgressProps) {
  void _tier;
  const pct = Math.min((unitsPledged / boxSize) * 100, 100);

  return (
    <div>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-mut">
            {formatNumber(unitsPledged)} واحد رزرو شده
          </span>
          <span className="font-extrabold text-ink" dir="ltr">
            {formatNumber(unitsPledged)}/{formatNumber(boxSize)}
          </span>
        </div>
      )}
      {/* Thin 5px bar matching dir-mono.jsx ThinBar */}
      <div
        className="overflow-hidden rounded-full"
        style={{
          height: 5,
          background: light ? "rgba(255,255,255,.25)" : "#F4F4F5",
        }}
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
