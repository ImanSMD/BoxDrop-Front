"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeliveries } from "@/lib/hooks/useDeliveries";
import { formatNumber } from "@/lib/format/number";
import { formatMoney } from "@/lib/format/money";
import { formatJalaliDate } from "@/lib/format/date";
import type { Delivery, DeliveryStatus } from "@/lib/api/types";

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  pending: "در انتظار",
  scheduled: "زمان‌بندی شد",
  out_for_delivery: "در مسیر",
  delivered: "تحویل شد",
  reconciled: "تسویه شد",
};

const PAST: DeliveryStatus[] = ["delivered", "reconciled"];
type Tab = "upcoming" | "past";

export default function DeliveriesPage() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const deliveries = useDeliveries();

  const { upcoming, past } = useMemo(() => {
    const list = deliveries.data ?? [];
    return {
      upcoming: list.filter((d) => !PAST.includes(d.status)),
      past: list.filter((d) => PAST.includes(d.status)),
    };
  }, [deliveries.data]);

  const shown = tab === "upcoming" ? upcoming : past;

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-card px-5 pb-2 pt-5">
        <h1 className="text-xl font-black text-ink">تحویل‌ها</h1>
      </div>

      <div className="flex border-b border-surface bg-card">
        <Tab active={tab === "upcoming"} onClick={() => setTab("upcoming")}>
          پیش‌رو ({formatNumber(upcoming.length)})
        </Tab>
        <Tab active={tab === "past"} onClick={() => setTab("past")}>
          گذشته ({formatNumber(past.length)})
        </Tab>
      </div>

      <div className="flex-1 space-y-3 p-4">
        {deliveries.isLoading &&
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}

        {deliveries.isError && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <span className="text-4xl">😕</span>
            <p className="text-sm text-muted-foreground">خطا در دریافت تحویل‌ها.</p>
            <button
              onClick={() => deliveries.refetch()}
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
            >
              تلاش دوباره
            </button>
          </div>
        )}

        {deliveries.isSuccess && shown.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🚚</span>
            <p className="text-sm text-muted-foreground">
              {tab === "upcoming" ? "تحویلی در پیش نیست" : "تحویل گذشته‌ای نداری"}
            </p>
          </div>
        )}

        {shown.map((d) => (
          <DeliveryCard key={d.id} delivery={d} />
        ))}
      </div>
    </div>
  );
}

function DeliveryCard({ delivery }: { delivery: Delivery }) {
  const refunded =
    delivery.final_fee !== null && delivery.final_fee < delivery.estimated_fee
      ? delivery.estimated_fee - delivery.final_fee
      : 0;

  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
      <div className="flex items-center justify-between px-4 pt-4">
        <div>
          <div className="text-sm font-extrabold text-ink">
            {formatJalaliDate(delivery.scheduled_date)}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {delivery.zone} • {delivery.window}
          </div>
        </div>
        <span className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-extrabold text-muted-foreground">
          {STATUS_LABEL[delivery.status]}
        </span>
      </div>

      <div className="space-y-1 px-4 py-3">
        {delivery.items.map((item, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-ink">{item.product_name}</span>
            <span className="text-muted-foreground">
              {formatNumber(item.quantity)} واحد
            </span>
          </div>
        ))}
      </div>

      {delivery.users_on_route !== null && (
        <div className="flex items-center gap-1.5 px-4 pb-3 text-[11px] text-muted-foreground">
          <Users className="size-3.5" />
          {formatNumber(delivery.users_on_route)} نفر در مسیر مشترک
        </div>
      )}

      {refunded > 0 && (
        <div className="bg-success/10 px-4 py-2.5 text-xs font-bold text-success">
          🎉 هزینه ارسال کمتر شد! {formatMoney(refunded)} به کیف پولت برگشت.
        </div>
      )}
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 border-b-[3px] py-3.5 text-sm font-extrabold ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}
