"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useUiStore } from "@/lib/store/ui";
import { useDeal, useJoinDeal } from "@/lib/hooks/useDeals";
import { useMe } from "@/lib/hooks/useMe";
import { formatNumber } from "@/lib/format/number";

export function JoinDealModal() {
  const dealId = useUiStore((s) => s.joinDealId);
  const closeJoin = useUiStore((s) => s.closeJoin);
  return (
    <Drawer open={dealId !== null} onOpenChange={(o) => !o && closeJoin()}>
      <DrawerContent dir="rtl" className="mx-auto max-w-md rounded-t-[26px]">
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
      <div className="p-6 text-center text-sm text-mut">
        در حال بارگذاری…
      </div>
    );
  }

  const goods = deal.wholesale_price * qty;
  const ship = deal.estimated_delivery_fee;
  const lock = goods + ship;

  const confirm = async () => {
    try {
      await join.mutateAsync({ quantity: qty });
      onDone();
    } catch {
      // error toast handled in hook
    }
  };

  return (
    <div dir="rtl" className="px-5 pb-7 pt-3 font-sans">
      {/* Handle */}
      <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-line" />

      {/* Product header */}
      <DrawerHeader className="p-0 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-[15px] bg-[#EDEDEF] text-2xl">
            {deal.product.emoji}
          </div>
          <div>
            <DrawerTitle className="text-right text-[16.5px] font-black text-ink">
              {deal.product.name}
            </DrawerTitle>
            <p className="text-[12px] text-mut">
              قیمت عمده: {formatNumber(deal.wholesale_price)} ت / واحد
            </p>
          </div>
        </div>
      </DrawerHeader>

      {/* Qty stepper */}
      <div className="flex items-center justify-between border-y border-line py-3.5">
        <span className="text-sm font-extrabold text-ink">چند تا می‌خوای؟</span>
        <div className="flex items-center overflow-hidden rounded-[13px] bg-surface">
          <button
            className="flex h-[42px] w-10 items-center justify-center bg-transparent text-[19px] font-extrabold text-ink"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="min-w-[26px] text-center text-[16px] font-black text-ink">
            {formatNumber(qty)}
          </span>
          <button
            className="flex h-[42px] w-10 items-center justify-center bg-transparent text-[19px] font-extrabold text-ink"
            onClick={() => setQty((q) => q + 1)}
          >
            +
          </button>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="py-3">
        <Row l={`قیمت محصول (${formatNumber(qty)} عدد)`} r={`${formatNumber(goods)} ت`} />
        <Row l="برآورد هزینه ارسال" r={`${formatNumber(ship)} ت`} />
        <Row
          l="احتمال بازگشت بخشی از ارسال"
          r="با تعداد همسایه‌ها"
          sub
          tone="#108A52"
        />
        <div className="flex items-center justify-between border-t border-line pt-3 mt-1.5">
          <span className="text-sm font-black text-ink">قفل می‌شه از کیف پول</span>
          <span className="text-[19px] font-black text-primary" dir="ltr">
            {formatNumber(lock)} ت
          </span>
        </div>
      </div>

      {/* Referral tip */}
      <div className="mb-4 flex items-center gap-3 rounded-[14px] bg-surface px-3.5 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-white">
          🎁
        </div>
        <div className="flex-1">
          <div className="text-[12.5px] font-extrabold text-ink">دوستت رو دعوت کن</div>
          <div className="text-[11px] text-mut">
            {me?.referral_code ? (
              <>
                با کد <span className="font-bold text-ink">{me.referral_code}</span>{" "}
              </>
            ) : null}
            ۲٪ کش‌بک برای هر دو وقتی دیل قفل شه
          </div>
        </div>
      </div>

      {/* Confirm — ink button + orange arrow (dir-mono.jsx pattern) */}
      <button
        onClick={confirm}
        disabled={join.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-[15px] bg-ink py-4 text-[15px] font-extrabold text-white disabled:opacity-60"
      >
        {join.isPending ? "در حال ثبت…" : "تأیید و پیوستن"}
        {!join.isPending && (
          <ChevronLeft size={18} strokeWidth={2} className="text-primary" />
        )}
      </button>

      <button
        onClick={onDone}
        className="mt-3 w-full bg-transparent py-2 text-[13px] font-bold text-mut"
      >
        بعداً
      </button>
    </div>
  );
}

function Row({
  l,
  r,
  sub,
  tone,
}: {
  l: string;
  r: string;
  sub?: boolean;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span
        className={sub ? "text-[11.5px] font-bold" : "text-[13px] font-semibold text-mut"}
        style={tone ? { color: tone } : undefined}
      >
        {l}
      </span>
      <span
        className={sub ? "text-[11px] font-extrabold" : "text-sm font-extrabold text-ink"}
        style={tone ? { color: tone } : undefined}
        dir="ltr"
      >
        {r}
      </span>
    </div>
  );
}
