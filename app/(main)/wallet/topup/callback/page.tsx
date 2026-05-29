"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { formatMoney } from "@/lib/format/money";

function CallbackContent() {
  const params = useSearchParams();
  const qc = useQueryClient();
  // Zarinpal returns Status=OK / NOK; our mock uses status=OK.
  const status = (params.get("status") ?? params.get("Status") ?? "").toUpperCase();
  const success = status === "OK";
  const amount = Number(params.get("amount") ?? 0);

  useEffect(() => {
    if (success) qc.invalidateQueries({ queryKey: ["wallet"] });
  }, [success, qc]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-6xl">{success ? "✅" : "❌"}</div>
      <h1 className="text-xl font-black text-ink">
        {success ? "پرداخت موفق بود" : "پرداخت ناموفق"}
      </h1>
      {success && amount > 0 && (
        <p className="text-sm text-muted-foreground">
          مبلغ {formatMoney(amount)} به کیف پولت اضافه شد.
        </p>
      )}
      {!success && (
        <p className="text-sm text-muted-foreground">
          تراکنش انجام نشد. می‌تونی دوباره تلاش کنی.
        </p>
      )}
      <Link
        href="/wallet"
        className="mt-2 rounded-2xl bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground"
      >
        بازگشت به کیف پول
      </Link>
    </div>
  );
}

export default function TopupCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  );
}
