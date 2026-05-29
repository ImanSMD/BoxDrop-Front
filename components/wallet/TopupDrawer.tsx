"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useTopup } from "@/lib/hooks/useWallet";
import { formatNumber, toEnglishDigits } from "@/lib/format/number";
import { formatMoney } from "@/lib/format/money";

const MIN_TOPUP = 50000;
const QUICK = [50000, 100000, 200000, 500000];

export function TopupDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const topup = useTopup();

  const submit = async () => {
    if (!amount || amount < MIN_TOPUP) {
      setError(`حداقل مبلغ شارژ ${formatMoney(MIN_TOPUP)} است.`);
      return;
    }
    setError(null);
    try {
      const res = await topup.mutateAsync(amount);
      // Hand off to the payment gateway (Zarinpal).
      window.location.href = res.redirect_url;
    } catch {
      /* error toast handled in hook */
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent dir="rtl" className="mx-auto max-w-md">
        <DrawerHeader className="px-5">
          <DrawerTitle className="text-right text-base font-extrabold text-ink">
            شارژ کیف پول
          </DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4 px-5 pb-6">
          <div className="rounded-2xl bg-surface px-4 py-3">
            <label className="mb-1 block text-xs font-bold text-muted-foreground">
              مبلغ (تومان)
            </label>
            <input
              inputMode="numeric"
              value={amount ? formatNumber(amount) : ""}
              onChange={(e) => {
                const n = Number(toEnglishDigits(e.target.value).replace(/\D/g, ""));
                setAmount(Number.isNaN(n) ? 0 : n);
                setError(null);
              }}
              placeholder="۵۰,۰۰۰"
              className="w-full bg-transparent text-2xl font-black text-ink outline-none"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setAmount(q);
                  setError(null);
                }}
                className={`rounded-xl py-2 text-xs font-bold ${
                  amount === q
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-ink"
                }`}
              >
                {formatNumber(q / 1000)}ک
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            onClick={submit}
            disabled={topup.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-[15px] bg-ink py-4 text-[15px] font-extrabold text-white disabled:opacity-60"
          >
            {topup.isPending ? "در حال انتقال…" : "پرداخت و شارژ"}
          </button>
          <p className="text-center text-[11px] text-muted-foreground">
            پرداخت از طریق درگاه امن زرین‌پال انجام می‌شود.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
