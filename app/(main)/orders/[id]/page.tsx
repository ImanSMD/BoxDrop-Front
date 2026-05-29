"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrder } from "@/lib/hooks/useOrders";
import { formatNumber } from "@/lib/format/number";
import { formatMoney } from "@/lib/format/money";
import { formatJalaliDateTime, formatJalaliDate } from "@/lib/format/date";
import { ORDER_STATUS_LABEL } from "@/lib/format/status";

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: order, isLoading, isError, refetch } = useOrder(params.id);

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-20 flex items-center justify-between bg-card px-4 py-3">
        <button onClick={() => router.back()} aria-label="بازگشت" className="text-ink">
          <ChevronRight className="size-6" />
        </button>
        <h1 className="font-extrabold text-ink">جزئیات سفارش</h1>
        <span className="w-6" />
      </div>

      {isLoading && (
        <div className="space-y-4 p-5">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      )}

      {isError && (
        <div className="mt-16 flex flex-col items-center gap-3 px-5 text-center">
          <span className="text-4xl">😕</span>
          <p className="text-sm text-muted-foreground">سفارش پیدا نشد.</p>
          <button
            onClick={() => refetch()}
            className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
          >
            تلاش دوباره
          </button>
        </div>
      )}

      {order && (
        <div className="flex-1 space-y-2">
          {/* Summary */}
          <div className="flex items-center gap-3 bg-card px-5 py-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-surface text-2xl">
              {order.deal.product.emoji}
            </div>
            <div className="flex-1">
              <div className="font-extrabold text-ink">
                {order.deal.product.name}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {formatNumber(order.quantity)} واحد •{" "}
                {ORDER_STATUS_LABEL[order.status]}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card px-5 py-5">
            <h2 className="mb-4 font-extrabold text-ink">وضعیت سفارش</h2>
            <ol>
              {order.timeline.map((step, i) => {
                const isLast = i === order.timeline.length - 1;
                return (
                  <li key={step.state} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex size-6 items-center justify-center rounded-full text-[11px] ${
                          step.done
                            ? "bg-success text-white"
                            : "bg-surface text-muted-foreground"
                        }`}
                      >
                        {step.done ? "✓" : ""}
                      </span>
                      {!isLast && (
                        <span
                          className={`my-1 w-0.5 flex-1 ${
                            step.done ? "bg-success" : "bg-surface"
                          }`}
                          style={{ minHeight: 28 }}
                        />
                      )}
                    </div>
                    <div className={`pb-4 ${step.done ? "" : "opacity-50"}`}>
                      <div className="text-sm font-bold text-ink">
                        {ORDER_STATUS_LABEL[step.state]}
                      </div>
                      {step.at && (
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatJalaliDateTime(step.at)}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Payment + delivery */}
          <div className="space-y-2 bg-card px-5 py-5">
            <h2 className="mb-2 font-extrabold text-ink">پرداخت و تحویل</h2>
            <Row label="تعداد" value={`${formatNumber(order.quantity)} واحد`} />
            <Row label="مبلغ قفل‌شده" value={formatMoney(order.total_locked)} />
            {order.delivery && (
              <>
                <Row label="منطقه" value={order.delivery.zone} />
                <Row
                  label="تاریخ تحویل"
                  value={formatJalaliDate(order.delivery.scheduled_date)}
                />
                <Row label="بازه زمانی" value={order.delivery.window} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-ink">{value}</span>
    </div>
  );
}
