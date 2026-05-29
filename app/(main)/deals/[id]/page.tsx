"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Timer } from "lucide-react";
import { DealProgress } from "@/components/deal/DealProgress";
import { DealTierLadder } from "@/components/deal/DealTierLadder";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useDeal } from "@/lib/hooks/useDeals";
import { useUiStore } from "@/lib/store/ui";
import { formatMoney } from "@/lib/format/money";
import { formatNumber } from "@/lib/format/number";
import { formatCountdown } from "@/lib/format/date";

export default function DealDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const openJoin = useUiStore((s) => s.openJoin);
  const { data: deal, isLoading, isError, refetch } = useDeal(params.id);

  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-card px-4 py-3">
        <button onClick={() => router.back()} aria-label="بازگشت" className="text-ink">
          <ChevronRight className="size-6" />
        </button>
        <h1 className="font-extrabold text-ink">جزئیات دیل</h1>
        <span className="w-6" />
      </div>

      {isLoading && (
        <div className="space-y-4 p-5">
          <Skeleton className="mx-auto size-24 rounded-3xl" />
          <Skeleton className="mx-auto h-5 w-1/2" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      )}

      {isError && (
        <div className="mt-16 flex flex-col items-center gap-3 px-5 text-center">
          <span className="text-4xl">😕</span>
          <p className="text-sm text-muted-foreground">دیل پیدا نشد یا خطایی رخ داد.</p>
          <button
            onClick={() => refetch()}
            className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
          >
            تلاش دوباره
          </button>
        </div>
      )}

      {deal && (
        <>
          <div className="flex-1 overflow-y-auto">
            {/* Hero */}
            <div className="flex flex-col items-center bg-card px-5 pb-6 pt-2 text-center">
              <div className="flex size-24 items-center justify-center rounded-3xl bg-surface text-5xl">
                {deal.product.emoji}
              </div>
              <h2 className="mt-3 text-xl font-black text-ink">
                {deal.product.name}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                عرضه‌کننده: {deal.supplier.business_name}
              </p>
              <div className="mt-3 flex items-center gap-2">
                {deal.zone && (
                  <span className="rounded-full bg-zone-vanak px-3 py-1 text-xs font-bold text-white">
                    {deal.zone.name}
                  </span>
                )}
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-muted-foreground">
                  📦 جعبه {formatNumber(deal.box_size)} تایی
                </span>
              </div>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-2xl font-black text-primary">
                  {formatMoney(deal.wholesale_price)}
                </span>
                <span className="pb-1 text-sm text-muted-foreground line-through">
                  {formatMoney(deal.retail_reference)}
                </span>
              </div>
              <span className="mt-2 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
                {formatNumber(deal.savings_percent)}٪ ارزون‌تر از بازار
              </span>
            </div>

            {/* Progress */}
            <Section title="📊 پیشرفت دیل">
              <DealProgress
                unitsPledged={deal.units_pledged}
                boxSize={deal.box_size}
                tier={deal.tier}
                markers={deal.tiers.map((t) => t.threshold)}
              />
              <div className="mt-3 flex items-center justify-center gap-1 rounded-xl bg-primary/5 py-2 text-xs font-bold text-primary">
                <Timer className="size-4" />
                تا قفل شدن دیل: {formatCountdown(deal.lock_deadline)}
              </div>
            </Section>

            {/* Tier ladder */}
            <Section title="🏆 مراحل و دستاوردها">
              <p className="mb-3 text-xs leading-6 text-muted-foreground">
                قیمت برای همه ثابته: {formatMoney(deal.wholesale_price)}. این مراحل
                فقط نشون می‌ده دیل چقدر گرم شده.
              </p>
              <DealTierLadder tiers={deal.tiers} unitsPledged={deal.units_pledged} />
            </Section>

            {/* Rewards */}
            <Section title="🎁 پاداش‌ها">
              <div className="space-y-2">
                <RewardCard
                  icon="🏆"
                  title="قهرمان حجم"
                  body={`هر کی بیشترین تعداد رو بخره، ${formatNumber(deal.rewards.volume_champion_pct)}٪ از مبلغش به کیف پولش برمی‌گرده.`}
                />
                <RewardCard
                  icon="🤝"
                  title="دعوت از دوست"
                  body={`دوستت رو دعوت کن. وقتی می‌پیونده، هر دو ${formatNumber(deal.rewards.referral_pct)}٪ کش‌بک می‌گیرید.`}
                />
              </div>
            </Section>

            {/* Description */}
            <Section title="📦 توضیحات محصول" last>
              <p className="text-sm leading-7 text-ink">{deal.description}</p>
            </Section>
          </div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 z-10 border-t border-border bg-card p-4">
            <Button
              onClick={() => openJoin(deal.id)}
              className="h-14 w-full rounded-2xl bg-primary text-base font-extrabold text-primary-foreground hover:bg-primary-dark"
            >
              پیوستن به دیل 🚀
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function Section({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section
      className={`bg-card px-5 py-5 ${last ? "" : "border-b-8 border-surface"}`}
    >
      <h3 className="mb-3 font-extrabold text-ink">{title}</h3>
      {children}
    </section>
  );
}

function RewardCard({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-surface p-3">
      <span className="text-xl">{icon}</span>
      <div>
        <strong className="text-sm font-extrabold text-ink">{title}</strong>
        <p className="mt-0.5 text-xs leading-6 text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
