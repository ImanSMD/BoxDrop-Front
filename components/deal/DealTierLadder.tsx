import type { DealTier, TierLevel } from "@/lib/api/types";
import { formatNumber } from "@/lib/format/number";

const TIER_ICON: Record<TierLevel, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
};

export function DealTierLadder({
  tiers,
  unitsPledged,
}: {
  tiers: DealTier[];
  unitsPledged: number;
}) {
  // The first tier not yet reached is the "current" stage.
  const currentIndex = tiers.findIndex((t) => unitsPledged < t.threshold);

  return (
    <div className="space-y-2">
      {tiers.map((tier, i) => {
        const unlocked = unitsPledged >= tier.threshold;
        const isCurrent = i === currentIndex;
        const remaining = tier.threshold - unitsPledged;

        return (
          <div
            key={tier.level}
            className={`flex items-center gap-3 rounded-2xl border-2 p-3 ${
              isCurrent
                ? "border-primary bg-primary/5"
                : unlocked
                  ? "border-transparent bg-success/5"
                  : "border-transparent bg-surface"
            }`}
          >
            <div className="text-2xl">{TIER_ICON[tier.level]}</div>
            <div className="flex-1">
              <div className="text-sm font-bold text-ink">
                {formatNumber(tier.threshold)} واحد و بیشتر
              </div>
              <div className="text-xs text-muted-foreground">{tier.label}</div>
            </div>
            {unlocked ? (
              <span className="rounded-full bg-success/10 px-3 py-1 text-[11px] font-bold text-success">
                ✓ آنلاک شد
              </span>
            ) : isCurrent ? (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                مرحله فعلی
              </span>
            ) : (
              <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-muted-foreground">
                {formatNumber(remaining)} واحد دیگه
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
