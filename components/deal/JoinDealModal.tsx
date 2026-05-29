"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/lib/store/ui";
import { useDeal, useJoinDeal } from "@/lib/hooks/useDeals";
import { useMe } from "@/lib/hooks/useMe";
import { formatMoney } from "@/lib/format/money";
import { formatNumber } from "@/lib/format/number";

/** Global Join sheet, driven by the ui store (opened from cards & deal page). */
export function JoinDealModal() {
  const dealId = useUiStore((s) => s.joinDealId);
  const closeJoin = useUiStore((s) => s.closeJoin);
  const open = dealId !== null;

  return (
    <Drawer open={open} onOpenChange={(o) => !o && closeJoin()}>
      <DrawerContent dir="rtl" className="mx-auto max-w-md">
        {dealId && <JoinContent dealId={dealId} onDone={closeJoin} />}
      </DrawerContent>
    </Drawer>
  );
}

function JoinContent({
  dealId,
  onDone,
}: {
  dealId: string;
  onDone: () => void;
}) {
  const { data: deal, isLoading } = useDeal(dealId);
  const { data: me } = useMe();
  const join = useJoinDeal(dealId);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (deal?.my_pledge) setQty(deal.my_pledge.quantity);
  }, [deal?.my_pledge]);

  if (isLoading || !deal) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        در حال بارگذاری…
      </div>
    );
  }

  const goods = deal.wholesale_price * qty;
  const deliveryFee = deal.estimated_delivery_fee;
  const total = goods + deliveryFee;

  const confirm = async () => {
    try {
      await join.mutateAsync({ quantity: qty });
      onDone();
    } catch {
      /* error toast handled in hook */
    }
  };

  return (
    <>
      <DrawerHeader className="px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-surface text-2xl">
            {deal.product.emoji}
          </div>
          <div className="text-right">
            <DrawerTitle className="text-base font-extrabold text-ink">
              {deal.product.name}
            </DrawerTitle>
            <p className="text-xs text-muted-foreground">
              قیمت عمده: {formatMoney(deal.wholesale_price)} / واحد
            </p>
          </div>
        </div>
      </DrawerHeader>

      <div className="space-y-4 px-5 pb-6">
        {/* Quantity stepper */}
        <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
          <span className="text-sm font-bold text-ink">چند تا می‌خوای؟</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex size-9 items-center justify-center rounded-full bg-card text-ink shadow-sm"
              aria-label="کاهش"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-6 text-center text-lg font-black text-ink">
              {formatNumber(qty)}
            </span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
              aria-label="افزایش"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        {/* Live totals */}
        <div className="space-y-2 rounded-2xl bg-surface p-4">
          <Row label={`بهای کالا (${formatNumber(qty)} واحد)`} value={formatMoney(goods)} />
          <Row label="هزینه ارسال تخمینی" value={formatMoney(deliveryFee)} />
          <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
            <span className="font-extrabold text-ink">مبلغ قابل قفل</span>
            <span className="text-lg font-black text-primary">
              {formatMoney(total)}
            </span>
          </div>
        </div>

        {/* Referral suggestion */}
        <div className="flex items-center gap-3 rounded-2xl bg-accent/10 p-3">
          <span className="text-xl">🤝</span>
          <div className="flex-1">
            <strong className="text-xs font-extrabold text-ink">
              دوستت رو دعوت کن
            </strong>
            <p className="text-[11px] text-muted-foreground">
              با کد{" "}
              <span className="font-bold text-primary">
                {me?.referral_code ?? "—"}
              </span>{" "}
              هر دو ۲٪ کش‌بک می‌گیرید.
            </p>
          </div>
        </div>

        <Button
          onClick={confirm}
          disabled={join.isPending}
          className="h-14 w-full rounded-2xl bg-primary text-base font-extrabold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
        >
          {join.isPending
            ? "در حال ثبت…"
            : `پیوستن و قفل ${formatMoney(total)} 🚀`}
        </Button>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-ink">{value}</span>
    </div>
  );
}
