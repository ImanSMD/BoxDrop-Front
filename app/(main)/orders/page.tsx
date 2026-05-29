"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/lib/hooks/useOrders";
import { formatNumber } from "@/lib/format/number";
import { formatMoney } from "@/lib/format/money";
import { formatJalaliDate } from "@/lib/format/date";
import type { Order } from "@/lib/api/types";

type Tab = "active" | "past";

const STAT: Record<string, { bg: string; col: string; label: string }> = {
  joined: { bg: "#FFEDE6", col: "#FF5A1F", label: "منتظر تکمیل" },
  locked: { bg: "#FFEDE6", col: "#FF5A1F", label: "قفل شده" },
  preparing: { bg: "#FBF1E3", col: "#B8730E", label: "در حال آماده‌سازی" },
  out_for_delivery: { bg: "#E4F2FA", col: "#0E76A8", label: "در حال ارسال" },
  delivered: { bg: "#E6F4EC", col: "#108A52", label: "تحویل شد" },
  canceled: { bg: "#FFEDE6", col: "#E0533A", label: "لغو شد" },
};

const PAST_STATUSES = ["delivered", "canceled"];

export default function OrdersPage() {
  const [tab, setTab] = useState<Tab>("active");
  const orders = useOrders();

  const { active, past } = useMemo(() => {
    const list = orders.data ?? [];
    return {
      active: list.filter((o) => !PAST_STATUSES.includes(o.status)),
      past: list.filter((o) => PAST_STATUSES.includes(o.status)),
    };
  }, [orders.data]);

  const shown = tab === "active" ? active : past;

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <div className="flex items-center border-b border-line px-[18px] pb-3 pt-5">
        <div className="w-10" />
        <h1 className="flex-1 text-center text-[16.5px] font-black text-ink">
          سفارش‌های من
        </h1>
        <Link
          href="/deliveries"
          className="w-10 text-right text-[11px] font-bold text-mut"
        >
          🚚
        </Link>
      </div>

      {/* Underline tabs */}
      <div className="flex gap-[22px] border-b border-line px-[18px]">
        <TabBtn active={tab === "active"} onClick={() => setTab("active")}>
          فعال ({formatNumber(active.length)})
        </TabBtn>
        <TabBtn active={tab === "past"} onClick={() => setTab("past")}>
          گذشته ({formatNumber(past.length)})
        </TabBtn>
      </div>

      <div className="flex-1 space-y-3 p-4">
        {orders.isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-[18px]" />
          ))}

        {orders.isError && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <span className="text-4xl">😕</span>
            <p className="text-sm text-mut">خطا در دریافت سفارش‌ها.</p>
            <button
              onClick={() => orders.refetch()}
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white"
            >
              تلاش دوباره
            </button>
          </div>
        )}

        {orders.isSuccess && shown.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">📦</span>
            <p className="text-sm text-mut">
              {tab === "active" ? "سفارش فعالی نداری" : "سفارش گذشته‌ای نداری"}
            </p>
          </div>
        )}

        {shown.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const s = STAT[order.status] ?? STAT.joined;
  return (
    <Link
      href={`/orders/${order.id}`}
      className="block overflow-hidden rounded-[18px] border border-line"
    >
      <div className="flex items-center gap-3 px-3.5 py-3">
        <div className="flex size-[50px] shrink-0 items-center justify-center rounded-[13px] bg-surface text-[26px]">
          {order.deal.product.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-extrabold text-ink">
            {order.deal.product.name}{" "}
            <span className="text-mut" dir="ltr">
              ×{formatNumber(order.quantity)}
            </span>
          </div>
          <div className="mt-0.5 text-[11.5px] font-semibold text-mut">
            {order.delivery
              ? `${order.delivery.zone} · ${formatJalaliDate(order.delivery.scheduled_date)}`
              : "در انتظار تکمیل دیل"}
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-3 py-1.5 text-[10.5px] font-extrabold"
          style={{ background: s.bg, color: s.col }}
        >
          {s.label}
        </span>
      </div>
      <div className="flex items-center justify-between bg-surface px-3.5 py-2.5 text-[12px]">
        <span className="font-semibold text-mut">
          {order.delivery ? `قفل شده در کیف پول` : `${formatNumber(order.deal.units_pledged)} از ${formatNumber(order.deal.box_size)} نفر پیوستن`}
        </span>
        <span className="font-black text-ink">{formatMoney(order.total_locked)}</span>
      </div>
    </Link>
  );
}

function TabBtn({
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
      className={`border-b-[2.5px] py-3 text-[13.5px] transition-colors ${
        active
          ? "border-primary font-extrabold text-ink"
          : "border-transparent font-semibold text-mut"
      }`}
    >
      {children}
    </button>
  );
}
