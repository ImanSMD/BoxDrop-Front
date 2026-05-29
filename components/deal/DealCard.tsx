"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Timer } from "lucide-react";
import type { Deal } from "@/lib/api/types";
import { DealProgress } from "./DealProgress";
import { formatNumber, toPersianDigits } from "@/lib/format/number";
import { formatMoney } from "@/lib/format/money";
import { getCountdown } from "@/lib/format/date";
import { useUiStore } from "@/lib/store/ui";

const ZONE_BADGE: Record<string, string> = {
  vanak: "bg-zone-vanak",
  ponak: "bg-zone-ponak",
  niavaran: "bg-zone-niavaran",
  saadatabad: "bg-zone-saadatabad",
  jordan: "bg-zone-jordan",
};

const AVATAR_BG = ["bg-zone-vanak", "bg-zone-ponak", "bg-tier-silver", "bg-primary"];

function useTick(ms = 1000) {
  const [, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((n) => n + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
}

function timerLabel(deadline: string): string {
  const c = getCountdown(deadline);
  if (c.expired) return "پایان یافته";
  const pad = (n: number) => toPersianDigits(String(n).padStart(2, "0"));
  if (c.days > 0) return `${formatNumber(c.days)} روز و ${formatNumber(c.hours)} ساعت`;
  return `${pad(c.hours)}:${pad(c.minutes)}:${pad(c.seconds)}`;
}

export function DealCard({ deal }: { deal: Deal }) {
  const router = useRouter();
  const openJoin = useUiStore((s) => s.openJoin);
  const [qty, setQty] = useState(deal.my_pledge?.quantity ?? 1);
  useTick();

  const remaining = Math.max(0, deal.box_size - deal.units_pledged);
  const nudge =
    remaining === 0
      ? "به قیمت عمده رسید! 🎉"
      : `${formatNumber(remaining)} واحد تا قیمت عمده`;
  const zoneClass = deal.zone ? ZONE_BADGE[deal.zone.id] ?? "bg-muted" : "bg-muted";
  const avatars = deal.participant_avatars.slice(0, 4);
  const extra = deal.participant_count - avatars.length;

  const goDetail = () => router.push(`/deals/${deal.id}`);

  return (
    <article
      onClick={goDetail}
      className="cursor-pointer rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/50"
    >
      <div className="flex gap-3">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-surface text-3xl">
          {deal.product.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-extrabold text-ink">{deal.product.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {deal.zone && (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold text-white ${zoneClass}`}
              >
                {deal.zone.name}
              </span>
            )}
            <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
              📦 {formatNumber(deal.box_size)} تایی
            </span>
          </div>
          <div className="mt-2 flex items-center">
            <div className="flex -space-x-2 space-x-reverse">
              {avatars.map((a, i) => (
                <span
                  key={i}
                  className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-card ${AVATAR_BG[i % AVATAR_BG.length]}`}
                >
                  {a}
                </span>
              ))}
              {extra > 0 && (
                <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-ink ring-2 ring-card">
                  +{formatNumber(extra)}
                </span>
              )}
            </div>
            <span className="ms-2 text-[11px] text-muted-foreground">
              {formatNumber(deal.participant_count)} نفر
            </span>
          </div>
        </div>
        <div className="shrink-0 text-left">
          <div className="font-black text-primary">
            {formatMoney(deal.wholesale_price)}
          </div>
          <div className="text-xs text-muted-foreground line-through">
            {formatMoney(deal.retail_reference)}
          </div>
          <div className="mt-0.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
            {formatNumber(deal.savings_percent)}٪ سود
          </div>
        </div>
      </div>

      <div className="mt-3">
        <DealProgress
          unitsPledged={deal.units_pledged}
          boxSize={deal.box_size}
          tier={deal.tier}
          markers={[Math.round(deal.box_size * 0.4), Math.round(deal.box_size * 0.75)]}
        />
      </div>

      <div className="mt-2 rounded-xl bg-accent/10 px-3 py-1.5 text-center text-xs font-bold text-primary-dark">
        {nudge}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-xs font-bold text-danger">
          <Timer className="size-4" />
          {timerLabel(deal.lock_deadline)}
        </span>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-3 rounded-full bg-surface px-2 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex size-6 items-center justify-center rounded-full bg-card text-ink"
              aria-label="کاهش"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="min-w-4 text-center text-sm font-bold text-ink">
              {formatNumber(qty)}
            </span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="flex size-6 items-center justify-center rounded-full bg-card text-ink"
              aria-label="افزایش"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openJoin(deal.id);
            }}
            className="rounded-full bg-primary px-4 py-2 text-sm font-extrabold text-primary-foreground hover:bg-primary-dark"
          >
            پیوستن 🚀
          </button>
        </div>
      </div>
    </article>
  );
}
