import { formatMoney } from "@/lib/format/money";

/** A stat chip on the wallet hero (available / locked). */
export function WalletBadge({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) {
  return (
    <div className="flex-1 rounded-2xl bg-white/10 px-4 py-3">
      <span className="mb-1 block text-[10px] font-semibold text-white/60">
        {label}
      </span>
      <span className="text-sm font-extrabold text-white">
        {formatMoney(amount)}
      </span>
    </div>
  );
}
