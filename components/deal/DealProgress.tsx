import type { TierLevel } from "@/lib/api/types";
import { formatNumber } from "@/lib/format/number";

const TIER_FILL: Record<TierLevel, string> = {
  bronze: "bg-tier-bronze",
  silver: "bg-tier-silver",
  gold: "bg-tier-gold",
};

const TIER_ICON: Record<TierLevel, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
};

type DealProgressProps = {
  unitsPledged: number;
  boxSize: number;
  tier: TierLevel;
  /** Threshold marker positions as unit counts (e.g. tier thresholds). */
  markers?: number[];
  showLabel?: boolean;
};

export function DealProgress({
  unitsPledged,
  boxSize,
  tier,
  markers = [],
  showLabel = true,
}: DealProgressProps) {
  const pct = Math.min((unitsPledged / boxSize) * 100, 100);

  return (
    <div>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {formatNumber(unitsPledged)} واحد رزرو شده
          </span>
          <strong className="text-ink">
            {formatNumber(unitsPledged)} از {formatNumber(boxSize)} {TIER_ICON[tier]}
          </strong>
        </div>
      )}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface">
        <div
          className={`h-full rounded-full transition-all ${TIER_FILL[tier]}`}
          style={{ width: `${pct}%` }}
        />
        {markers.map((m, i) => (
          <span
            key={i}
            className="absolute top-0 h-full w-0.5 bg-card/70"
            style={{ insetInlineEnd: `${Math.min((m / boxSize) * 100, 100)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
