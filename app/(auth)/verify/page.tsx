"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRequestOtp, useVerifyOtp } from "@/lib/hooks/useAuth";
import { toEnglishDigits, toPersianDigits } from "@/lib/format/number";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 120;

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get("phone") ?? "";
  const ref = params.get("ref") ?? undefined;

  const verifyOtp = useVerifyOtp();
  const requestOtp = useRequestOtp();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!phone) router.replace("/login");
  }, [phone, router]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const submit = async (code: string) => {
    setError(null);
    try {
      const result = await verifyOtp.mutateAsync({
        phone,
        code,
        referral_code: ref,
      });
      router.replace(result.is_new ? "/onboarding" : "/");
    } catch {
      setError("کد واردشده درست نیست.");
      setDigits(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
    }
  };

  const handleChange = (index: number, raw: string) => {
    const value = toEnglishDigits(raw).replace(/\D/g, "");
    if (!value) {
      setDigits((d) => d.map((c, i) => (i === index ? "" : c)));
      return;
    }
    const next = [...digits];
    // Support paste of the full code into one box.
    if (value.length > 1) {
      value
        .slice(0, OTP_LENGTH - index)
        .split("")
        .forEach((ch, k) => (next[index + k] = ch));
      setDigits(next);
      const filled = next.filter(Boolean).length;
      if (filled === OTP_LENGTH) submit(next.join(""));
      else inputs.current[Math.min(index + value.length, OTP_LENGTH - 1)]?.focus();
      return;
    }
    next[index] = value;
    setDigits(next);
    if (index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
    if (next.every(Boolean)) submit(next.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const resend = async () => {
    if (seconds > 0 || !phone) return;
    await requestOtp.mutateAsync(phone);
    setSeconds(RESEND_SECONDS);
  };

  return (
    <div className="flex flex-1 flex-col">
      <button
        onClick={() => router.back()}
        className="mb-2 w-10 text-2xl text-ink"
        aria-label="بازگشت"
      >
        ›
      </button>

      <div className="mb-8 mt-2">
        <h1 className="text-2xl font-black text-ink">کد تأیید را وارد کن</h1>
        <p className="mt-2 leading-7 text-muted-foreground">
          کد ۶ رقمی به شماره{" "}
          <span dir="ltr" className="font-bold text-ink">
            {toPersianDigits(phone)}
          </span>{" "}
          ارسال شد.
        </p>
      </div>

      <div dir="ltr" className="flex justify-center gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={toPersianDigits(d)}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            inputMode="numeric"
            maxLength={OTP_LENGTH}
            autoFocus={i === 0}
            className="h-14 w-12 rounded-2xl border-2 border-transparent bg-surface text-center text-xl font-black text-ink outline-none focus:border-primary focus:bg-card"
          />
        ))}
      </div>

      {error && <p className="mt-3 text-center text-sm text-danger">{error}</p>}

      <div className="mt-6 text-center">
        {seconds > 0 ? (
          <p className="text-sm text-muted-foreground">
            ارسال مجدد کد تا {toPersianDigits(String(seconds))} ثانیه دیگر
          </p>
        ) : (
          <button
            onClick={resend}
            className="text-sm font-bold text-primary"
            disabled={requestOtp.isPending}
          >
            ارسال مجدد کد
          </button>
        )}
      </div>

      <div className="mt-auto pt-6">
        <Button
          onClick={() => submit(digits.join(""))}
          disabled={digits.some((d) => !d) || verifyOtp.isPending}
          className="h-14 w-full rounded-2xl bg-primary text-base font-extrabold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
        >
          {verifyOtp.isPending ? "در حال بررسی…" : "تأیید"}
        </Button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}
