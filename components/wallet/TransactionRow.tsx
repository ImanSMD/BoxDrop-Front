import type { WalletTransaction, WalletTransactionType } from "@/lib/api/types";
import { formatNumber } from "@/lib/format/number";
import { formatJalaliDate } from "@/lib/format/date";
import { TOMAN_SHORT } from "@/lib/format/money";

const TYPE_ICON: Record<WalletTransactionType, string> = {
  topup: "💳",
  lock: "🔒",
  unlock: "🔓",
  capture: "🧾",
  refund: "↩️",
  cashback: "🎁",
  delivery_reconciliation: "🚚",
};

export function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const credit = tx.amount >= 0;
  const sign = credit ? "+" : "−";

  return (
    <div className="flex items-center gap-3 bg-card px-5 py-3.5">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full text-lg ${
          credit ? "bg-success/10" : "bg-danger/10"
        }`}
      >
        {TYPE_ICON[tx.type]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-ink">{tx.description}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          {formatJalaliDate(tx.created_at)}
        </div>
      </div>
      <div
        className={`shrink-0 text-sm font-black ${credit ? "text-success" : "text-ink"}`}
      >
        {sign} {formatNumber(Math.abs(tx.amount))} {TOMAN_SHORT}
      </div>
    </div>
  );
}
