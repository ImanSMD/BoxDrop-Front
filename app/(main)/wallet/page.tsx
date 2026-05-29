"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import { WalletBadge } from "@/components/wallet/WalletBadge";
import { TransactionRow } from "@/components/wallet/TransactionRow";
import { TopupDrawer } from "@/components/wallet/TopupDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet, useWalletTransactions } from "@/lib/hooks/useWallet";
import { TOMAN_SHORT } from "@/lib/format/money";
import { formatNumber } from "@/lib/format/number";

export default function WalletPage() {
  const router = useRouter();
  const wallet = useWallet();
  const txns = useWalletTransactions();

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-br from-ink to-[#2D2D50] px-5 pb-6 pt-5 text-white">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => router.back()} aria-label="بازگشت">
            <ChevronRight className="size-6" />
          </button>
          <h1 className="font-extrabold">کیف پول</h1>
          <span className="w-6" />
        </div>

        <p className="text-xs text-white/70">موجودی قابل استفاده</p>
        {wallet.isSuccess ? (
          <div className="mt-1 text-4xl font-black">
            {formatNumber(wallet.data.available)}
            <span className="ms-1 text-base font-semibold">{TOMAN_SHORT}</span>
          </div>
        ) : (
          <Skeleton className="mt-1 h-10 w-40 bg-white/20" />
        )}

        <div className="mt-4 flex gap-2">
          <WalletBadge label="قابل استفاده" amount={wallet.data?.available ?? 0} />
          <WalletBadge label="قفل‌شده" amount={wallet.data?.locked ?? 0} />
        </div>
      </div>

      {/* Action */}
      <div className="border-b-8 border-surface bg-card px-5 py-4">
        <TopupDrawer>
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-extrabold text-primary-foreground hover:bg-primary-dark">
            <Plus className="size-5" />
            شارژ کیف پول
          </button>
        </TopupDrawer>
      </div>

      {/* Transactions */}
      <div className="flex-1">
        <h2 className="px-5 py-3 text-sm font-extrabold text-ink">تراکنش‌ها</h2>

        {txns.isLoading && (
          <div className="space-y-px">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 bg-card px-5 py-3.5">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        )}

        {txns.isSuccess && txns.data.results.length === 0 && (
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🧾</span>
            <p className="text-sm text-muted-foreground">هنوز تراکنشی نداری</p>
          </div>
        )}

        {txns.isSuccess && (
          <div className="divide-y divide-surface">
            {txns.data.results.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
