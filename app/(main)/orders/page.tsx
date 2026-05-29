"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/lib/hooks/useOrders";
import { formatNumber } from "@/lib/format/number";
import { formatMoney } from "@/lib/format/money";
import { formatJalaliDate } from "@/lib/format/date";
import {
  ORDER_STATUS_BADGE,
  ORDER_STATUS_LABEL,
  isPastOrder,
} from "@/lib/format/status";
import type { Order } from "@/lib/api/types";

type Tab = "active" | "past";

export default function OrdersPage() {
  const [tab, setTab] = useState<Tab>("active");
  const orders = useOrders();

  const { active, past } = useMemo(() => {
    const list = orders.data ?? [];
    return {
      active: list.filter((o) => !isPastOrder(o.status)),
      past: list.filter((o) => isPastOrder(o.status)),
    };
  }, [orders.data]);

  const shown = tab === "active" ? active : past;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between bg-card px-5 pb-2 pt-5">
        <h1 className="text-xl font-black text-ink">سفارش‌ها</h1>
        <Link
          href="/deliveries"
          className="flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-ink"
        >
          🚚 تحویل‌ها
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface bg-card">
        <TabButton active={tab === "active"} onClick={() => setTab("active")}>
          فعال ({formatNumber(active.length)})
        </TabButton>
        <TabButton active={tab === "past"} onClick={() => setTab("past")}>
          گذشته ({formatNumber(past.length)})
        </TabButton>
      </div>

      <div className="flex-1 space-y-3 p-4">
        {orders.isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}

        {orders.isSuccess && shown.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">📦</span>
            <p className="text-sm text-muted-foreground">
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
  return (
    <Link
      href={`/orders/${order.id}`}
      className="block overflow-hidden rounded-2xl bg-card ring-1 ring-border/60"
    >
      <div className="flex items-center gap-3 p-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-surface text-2xl">
          {order.deal.product.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-extrabold text-ink">
            {order.deal.product.name}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {formatNumber(order.quantity)} واحد
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${ORDER_STATUS_BADGE[order.status]}`}
        >
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>
      <div className="flex items-center justify-between bg-surface px-4 py-2.5 text-xs">
        <span className="text-muted-foreground">
          {order.delivery
            ? `تحویل: ${formatJalaliDate(order.delivery.scheduled_date)} • ${order.delivery.window}`
            : "زمان تحویل پس از قفل شدن دیل"}
        </span>
        <span className="font-extrabold text-ink">
          {formatMoney(order.total_locked)}
        </span>
      </div>
    </Link>
  );
}

function TabButton({
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
