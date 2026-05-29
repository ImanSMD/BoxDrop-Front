"use client";

import { ChevronRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { TopupDrawer } from "@/components/wallet/TopupDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet, useWalletTransactions } from "@/lib/hooks/useWallet";
import { formatNumber } from "@/lib/format/number";
import { formatJalaliDate } from "@/lib/format/date";
import type { WalletTransaction, WalletTransactionType } from "@/lib/api/types";

const TX_ICON_EMOJI: Record<WalletTransactionType, string> = {
  topup: "💳",
  lock: "🔒",
  unlock: "🔓",
  capture: "🧾",
  refund: "↩️",
  cashback: "🏆",
  delivery_reconciliation: "🚚",
};

export default function WalletPage() {
  const router = useRouter();
  const wallet = useWallet();
  const txns = useWalletTransactions();

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <div className="flex items-center border-b border-line px-[18px] pb-3 pt-2">
        <div className="w-10">
          <button
            onClick={() => router.back()}
            className="flex size-10 items-center justify-center rounded-[12px]"
          >
            <ChevronRight size={21} strokeWidth={2} className="text-ink" />
          </button>
        </div>
        <div className="flex-1 text-center text-[16.5px] font-black text-ink">
          کیف پول
        </div>
        <div className="w-10" />
      </div>

      {/* Dark balance card */}
      <div className="px-4 pt-4">
        <div className="rounded-[22px] bg-dark px-[22px] pb-5 pt-[22px]">
          <div className="text-[12px] font-semibold text-[#A1A1AA]">
            موجودی قابل استفاده
          </div>
          {wallet.isSuccess ? (
            <div className="mt-1.5 text-[38px] font-black leading-none tracking-[-1px] text-white">
              {formatNumber(wallet.data.available)}{" "}
              <span className="text-[15px] text-[#A1A1AA]">ت</span>
            </div>
          ) : (
            <Skeleton className="mt-1.5 h-10 w-36 bg-white/20" />
          )}
          <div className="mt-4 flex gap-2.5">
            {[
              ["قفل شده در دیل‌ها", wallet.data?.locked ?? 0],
              ["کل صرفه‌جویی", 124500],
            ].map(([label, val], i) => (
              <div
                key={i}
                className="flex-1 rounded-[13px] px-3 py-2.5"
                style={{ background: "rgba(255,255,255,.08)" }}
              >
                <div className="text-[10.5px] font-semibold text-[#9A9AA2]">
                  {label}
                </div>
                <div className="mt-1 text-[14.5px] font-black text-white">
                  {formatNumber(val as number)} ت
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 border-b-[8px] border-surface px-4 py-4">
        <TopupDrawer>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-primary py-3.5 text-[14px] font-extrabold text-white">
            <Plus size={17} strokeWidth={2.4} />
            افزایش موجودی
          </button>
        </TopupDrawer>
        <button className="rounded-[14px] bg-surface px-[18px] py-3.5 text-[14px] font-extrabold text-ink">
          سوابق
        </button>
      </div>

      {/* Transactions */}
      <div className="flex-1 px-[18px] py-4">
        <h2 className="mb-1 text-[14px] font-black text-mut">
          تراکنش‌های اخیر
        </h2>

        {txns.isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3.5 border-b border-line">
              <Skeleton className="size-[38px] rounded-[12px]" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
              <Skeleton className="h-4 w-14" />
            </div>
          ))}

        {txns.isSuccess && txns.data.results.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🧾</span>
            <p className="text-sm text-mut">هنوز تراکنشی نداری</p>
          </div>
        )}

        {txns.isSuccess &&
          txns.data.results.map((tx, i, arr) => (
            <TxRow key={tx.id} tx={tx} last={i === arr.length - 1} />
          ))}
      </div>
    </div>
  );
}

function TxRow({ tx, last }: { tx: WalletTransaction; last: boolean }) {
  const credit = tx.amount >= 0;
  return (
    <div
      className={`flex items-center gap-3 py-3.5 ${!last ? "border-b border-line" : ""}`}
    >
      <div
        className="flex size-[38px] shrink-0 items-center justify-center rounded-[12px] text-lg"
        style={{ background: credit ? "#E6F4EC" : "#F4F4F5" }}
      >
        {TX_ICON_EMOJI[tx.type]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-extrabold text-ink">
          {tx.description}
        </div>
        <div className="mt-0.5 text-[11px] text-mut">
          {formatJalaliDate(tx.created_at)}
        </div>
      </div>
      <div
        className="shrink-0 text-sm font-black"
        style={{ color: credit ? "#108A52" : "#111114" }}
        dir="ltr"
      >
        {credit ? "+" : "−"} {formatNumber(Math.abs(tx.amount))} ت
      </div>
    </div>
  );
}
