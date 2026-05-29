"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Minus, Plus } from "lucide-react";
import type { Deal, TierLevel } from "@/lib/api/types";
import { DealProgress } from "./DealProgress";
import { formatNumber } from "@/lib/format/number";
import { getCountdown } from "@/lib/format/date";
import { useUiStore } from "@/lib/store/ui";

const ZONE_DOT: Record<string, string> = {
  vanak: "#7C5CFF",
  ponak: "#0E9FD8",
  niavaran: "#0FA968",
  saadatabad: "#E8902B",
  jordan: "#E0533A",
};

const AVATAR_BG = ["#7C5CFF", "#0E9FD8", "#E8902B", "#0FA968"];

const TIER: Record<
  TierLevel,
  { emoji: string; label: string; bg: string; col: string }
> = {
  bronze: { emoji: "🥉", label: "گرم شدن", bg: "#E4F2FA", col: "#0E76A8" },
  silver: { emoji: "🥈", label: "داغ شد", bg: "#FBF1E3", col: "#B8730E" },
  gold: { emoji: "🥇", label: "عمده شد", bg: "#E6F4EC", col: "#108A52" },
};

// Shown before a deal reaches the bronze threshold (tier === null).
const FRESH_TIER = { emoji: "✨", label: "تازه", bg: "#F4F4F5", col: "#71717A" };

/** Re-render every second so the countdown stays live. */
function useTick(ms = 1000) {
  const [, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((n) => n + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
}

function countdownLabel(deadline: string): string {
  const c = getCountdown(deadline);
  if (c.expired) return "پایان یافته";
  if (c.days > 0) return `${formatNumber(c.days)} روز و ${formatNumber(c.hours)} ساعت`;
  if (c.hours > 0) return `${formatNumber(c.hours)} ساعت و ${formatNumber(c.minutes)} دقیقه`;
  return `${formatNumber(c.minutes)} دقیقه`;
}

/**
 * Bold Mono deal card — compact identity row with restored social proof
 * (avatars), tier badge, live countdown, and a quantity stepper + join button.
 * The stepper writes to the shared UI store so the JoinDealModal opens with the
 * same quantity the user picked here.
 */
export function DealCard({ deal }: { deal: Deal }) {
  const router = useRouter();
  const openJoin = useUiStore((s) => s.openJoin);
  const setDealQty = useUiStore((s) => s.setDealQty);
  const storedQty = useUiStore((s) => s.dealQty[deal.id]);
  const qty = storedQty ?? deal.my_pledge?.quantity ?? 1;
  useTick();

  const zoneColor = deal.zone ? (ZONE_DOT[deal.zone.id] ?? "#A1A1AA") : "#A1A1AA";
  const tier = deal.tier ? TIER[deal.tier] : FRESH_TIER;
  const avatars = deal.participant_avatars.slice(0, 4);
  const extra = deal.participant_count - avatars.length;
  const expired = getCountdown(deal.lock_deadline).expired;

  return (
    <div
      onClick={() => router.push(`/deals/${deal.id}`)}
      className="mb-3 cursor-pointer rounded-[20px] border border-line bg-white p-3.5"
    >
      {/* Identity: photo + name + tier + zone + avatars */}
      <div className="flex gap-3">
        <div
          className="flex shrink-0 items-center justify-center rounded-[15px] bg-[#EDEDEF] text-3xl"
          style={{ width: 60, height: 60 }}
        >
          {deal.product.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="truncate text-[14.5px] font-extrabold leading-snug text-ink">
              {deal.product.name}
            </div>
            <span
              className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold"
              style={{ background: tier.bg, color: tier.col }}
            >
              <span className="leading-none">{tier.emoji}</span>
              {tier.label}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-mut">
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

          {/* Social proof — overlapping avatars + count */}
          <div className="mt-2 flex items-center">
            <div className="flex">
              {avatars.map((a, i) => (
                <span
                  key={i}
                  className="flex size-[22px] items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-white [&:not(:first-child)]:-ms-1.5"
                  style={{ background: AVATAR_BG[i % AVATAR_BG.length] }}
                >
                  {a}
                </span>
              ))}
              {extra > 0 && (
                <span className="flex size-[22px] items-center justify-center rounded-full bg-surface text-[9px] font-bold text-ink ring-2 ring-white [&:not(:first-child)]:-ms-1.5">
                  +{formatNumber(extra)}
                </span>
              )}
            </div>
            <span className="ms-2 text-[10.5px] text-mut">
              {formatNumber(deal.participant_count)} نفر پیوستن
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3 flex items-center gap-2">
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

      {/* Countdown */}
      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-mut">
        <Clock size={13} strokeWidth={2} />
        <span>{countdownLabel(deal.lock_deadline)}</span>
      </div>

      <div className="my-3 h-px bg-line" />

      {/* Price + stepper + join */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[17px] font-black leading-none tracking-tight text-ink">
            {formatNumber(deal.wholesale_price)}
            <span className="text-[11px] font-bold text-mut"> ت</span>
          </span>
          <span className="text-[10px] text-[#BFBFC6] line-through">
            {formatNumber(deal.retail_reference)}
          </span>
          <span className="text-[10px] font-extrabold text-primary">
            ٪{formatNumber(deal.savings_percent)}−
          </span>
        </div>

        {/* Stop propagation so tapping controls doesn't open the detail page */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center overflow-hidden rounded-[11px] bg-surface">
            <button
              type="button"
              onClick={() => setDealQty(deal.id, qty - 1)}
              className="flex size-8 items-center justify-center text-ink"
              aria-label="کاهش تعداد"
            >
              <Minus size={15} strokeWidth={2.4} />
            </button>
            <span className="min-w-[22px] text-center text-[13px] font-black text-ink">
              {formatNumber(qty)}
            </span>
            <button
              type="button"
              onClick={() => setDealQty(deal.id, qty + 1)}
              className="flex size-8 items-center justify-center text-ink"
              aria-label="افزایش تعداد"
            >
              <Plus size={15} strokeWidth={2.4} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => openJoin(deal.id)}
            disabled={expired}
            className="rounded-[11px] bg-ink px-4 py-2 text-[12.5px] font-extrabold text-white disabled:opacity-50"
          >
            {expired ? "پایان یافته" : "پیوستن"}
          </button>
        </div>
      </div>
    </div>
  );
}
