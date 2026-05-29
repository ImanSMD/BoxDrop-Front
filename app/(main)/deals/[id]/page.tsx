"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, Share2, Clock } from "lucide-react";
import { DealProgress } from "@/components/deal/DealProgress";
import { DealTierLadder } from "@/components/deal/DealTierLadder";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeal } from "@/lib/hooks/useDeals";
import { useUiStore } from "@/lib/store/ui";
import { formatNumber } from "@/lib/format/number";
import { formatCountdown } from "@/lib/format/date";

export default function DealDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const openJoin = useUiStore((s) => s.openJoin);
  const { data: deal, isLoading, isError, refetch } = useDeal(params.id);

  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const share = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const title = deal ? `${deal.product.name} در BoxDrop` : "BoxDrop";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user dismissed the share sheet — nothing to do
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("لینک دیل کپی شد.");
    } catch {
      toast.error("کپی لینک ناموفق بود.");
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-white">
      {isLoading && (
        <div className="space-y-4 p-5">
          <Skeleton className="h-[320px] w-full" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      )}

      {isError && (
        <div className="mt-16 flex flex-col items-center gap-3 px-5 text-center">
          <span className="text-4xl">😕</span>
          <p className="text-sm text-mut">دیل پیدا نشد یا خطایی رخ داد.</p>
          <button
            onClick={() => refetch()}
            className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white"
          >
            تلاش دوباره
          </button>
        </div>
      )}

      {deal && (
        <>
          {/* Full-bleed hero (320px) */}
          <div className="relative" style={{ height: 320 }}>
            <div className="absolute inset-0 flex items-center justify-center bg-[#EDEDEF] text-8xl">
              {deal.product.emoji}
            </div>

            {/* Back + share (over image) */}
            <div className="absolute right-4 left-4 top-12 flex justify-between">
              <div
                onClick={() => router.back()}
                className="flex size-[38px] cursor-pointer items-center justify-center rounded-[12px] shadow-md"
                style={{ background: "rgba(255,255,255,.92)" }}
              >
                <ChevronRight size={20} strokeWidth={2} className="text-ink" />
              </div>
              <button
                onClick={share}
                aria-label="اشتراک‌گذاری دیل"
                className="flex size-[38px] cursor-pointer items-center justify-center rounded-[12px] shadow-md"
                style={{ background: "rgba(255,255,255,.92)" }}
              >
                <Share2 size={18} strokeWidth={1.9} className="text-ink" />
              </button>
            </div>

            {/* Heat + zone badges */}
            <div className="absolute bottom-3.5 right-4 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-extrabold text-white">
                🔥 {heatLabel(deal.units_pledged, deal.box_size)}
              </span>
              {deal.zone && (
                <span
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold text-ink"
                  style={{ background: "rgba(255,255,255,.92)" }}
                >
                  <span
                    className="inline-block size-[6px] rounded-full"
                    style={{ background: ZONE_COLOR[deal.zone.id] ?? "#A1A1AA" }}
                  />
                  {deal.zone.name}
                </span>
              )}
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            {/* Name + price */}
            <div className="border-b-[8px] border-surface px-5 pb-4 pt-[18px]">
              <h1 className="text-[23px] font-black leading-snug tracking-tight text-ink">
                {deal.product.name}
              </h1>
              <p className="mt-1.5 text-[12.5px] text-mut">
                عرضه‌کننده: {deal.supplier.business_name} · جعبه{" "}
                {formatNumber(deal.box_size)}‌تایی
              </p>
              <div className="mt-3.5 flex items-baseline gap-2.5">
                <span className="text-[30px] font-black tracking-tight text-primary">
                  {formatNumber(deal.wholesale_price)}{" "}
                  <span className="text-[15px] text-ink">تومان</span>
                </span>
                <span className="text-sm text-[#BFBFC6] line-through">
                  {formatNumber(deal.retail_reference)}
                </span>
                <span className="text-[13px] font-black text-[#108A52]">
                  ٪{formatNumber(deal.savings_percent)}−
                </span>
              </div>
            </div>

            {/* Progress + countdown */}
            <div className="border-b-[8px] border-surface px-5 py-[18px]">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-sm font-extrabold text-ink">
                  {formatNumber(deal.units_pledged)} از{" "}
                  {formatNumber(deal.box_size)} همسایه پیوستن
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-bold text-mut">
                  <Clock size={14} strokeWidth={2} />
                  <span dir="ltr">{formatCountdown(deal.lock_deadline)}</span>
                </span>
              </div>
              <DealProgress
                unitsPledged={deal.units_pledged}
                boxSize={deal.box_size}
                tier={deal.tier}
              />
            </div>

            {/* Tier ladder */}
            <div className="border-b-[8px] border-surface px-5 py-[18px]">
              <h3 className="mb-1 text-[15px] font-black text-ink">
                مراحل گرم شدن دیل
              </h3>
              <p className="mb-4 text-[12px] leading-relaxed text-mut">
                قیمت برای همه ثابته: {formatNumber(deal.wholesale_price)} ت —
                این مراحل فقط نشون می‌ده دیل چقدر گرم شده.
              </p>
              <DealTierLadder
                tiers={deal.tiers}
                unitsPledged={deal.units_pledged}
              />
            </div>

            {/* Rewards */}
            <div className="border-b-[8px] border-surface px-5 pb-5">
              <h3 className="mb-0.5 pt-[18px] text-[15px] font-black text-ink">
                پاداش‌ها
              </h3>
              <RewardRow
                icon="🏆"
                title="قهرمان حجم"
                body={`هر کی بیشترین تعداد رو بخره، ${formatNumber(deal.rewards.volume_champion_pct)}٪ از مبلغش برمی‌گرده به کیف پولش`}
              />
              <RewardRow
                icon="🤝"
                title="دعوت از دوست"
                body={`دوستت رو دعوت کن؛ هر دو ${formatNumber(deal.rewards.referral_pct)}٪ کش‌بک می‌گیرید`}
              />
            </div>

            {/* Description */}
            <div className="px-5 py-5">
              <h3 className="mb-2 text-[15px] font-black text-ink">
                توضیحات محصول
              </h3>
              <p className="text-sm leading-7 text-ink">{deal.description}</p>
            </div>
          </div>

          {/* Sticky CTA footer — ink button + orange icon */}
          <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t border-line bg-white px-5 pb-7 pt-3">
            <button
              onClick={() => openJoin(deal.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-[15px] bg-ink py-4 text-[15px] font-extrabold text-white"
            >
              پیوستن به دیل
              <ChevronRight
                size={18}
                strokeWidth={2}
                className="rotate-180 text-primary"
              />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const ZONE_COLOR: Record<string, string> = {
  vanak: "#7C5CFF",
  ponak: "#0E9FD8",
  niavaran: "#0FA968",
  saadatabad: "#E8902B",
  jordan: "#E0533A",
};

function heatLabel(filled: number, box: number) {
  const r = filled / box;
  if (filled >= box) return "جعبه پر شد";
  if (r >= 0.75) return "داغ شد";
  if (r >= 0.4) return "در حال گرم شدن";
  return "تازه باز شده";
}

function RewardRow({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-line py-3.5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-surface text-xl">
        {icon}
      </div>
      <div>
        <div className="text-[13.5px] font-extrabold text-ink">{title}</div>
        <div className="mt-0.5 text-[11.5px] leading-relaxed text-mut">
          {body}
        </div>
      </div>
    </div>
  );
}
