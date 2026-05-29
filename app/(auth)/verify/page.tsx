"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      const result = await verifyOtp.mutateAsync({ phone, code, referral_code: ref });
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
    if (value.length > 1) {
      value.slice(0, OTP_LENGTH - index).split("").forEach((ch, k) => (next[index + k] = ch));
      setDigits(next);
      if (next.every(Boolean)) submit(next.join(""));
      else inputs.current[Math.min(index + value.length, OTP_LENGTH - 1)]?.focus();
      return;
    }
    next[index] = value;
    setDigits(next);
    if (index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
    if (next.every(Boolean)) submit(next.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0)
      inputs.current[index - 1]?.focus();
  };

  const resend = async () => {
    if (seconds > 0 || !phone) return;
    await requestOtp.mutateAsync(phone);
    setSeconds(RESEND_SECONDS);
  };

  return (
    <div className="flex flex-1 flex-col pt-3">
      {/* Back */}
      <div className="pb-1 pt-2">
        <button
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center rounded-[12px] bg-surface"
        >
          <ChevronRight size={20} strokeWidth={2} className="text-ink" />
        </button>
      </div>

      {/* Headline */}
      <div className="pb-6 pt-6">
        <h1 className="text-[25px] font-black leading-[1.35] tracking-[-0.4px] text-ink">
          کد تأیید رو<br />وارد کن
        </h1>
        <p className="mt-2.5 text-[13.5px] leading-7 text-mut">
          یه کد ۶ رقمی به شماره{" "}
          <span dir="ltr" className="font-extrabold text-ink">
            {toPersianDigits(phone)}
          </span>{" "}
          فرستادیم.
        </p>
      </div>

      {/* OTP cells — Bold Mono style: filled = white bg + ink border, empty = chip bg */}
      <div dir="ltr" className="flex justify-between gap-2">
        {digits.map((d, i) => {
          const filled = d !== "";
          return (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              value={toPersianDigits(d)}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={OTP_LENGTH}
              autoFocus={i === 0}
              className="h-[58px] flex-1 rounded-[14px] text-center text-[22px] font-black text-ink outline-none transition-colors"
              style={{
                background: filled ? "#FFFFFF" : "#F4F4F5",
                border: `1.5px solid ${filled ? "#111114" : "transparent"}`,
              }}
            />
          );
        })}
      </div>

      {error && <p className="mt-3 text-center text-[12px] text-danger">{error}</p>}

      {/* Resend */}
      <div className="mt-4 text-center text-[13px] font-semibold text-mut">
        {seconds > 0 ? (
          <>
            دریافت نکردی؟ ارسال مجدد در{" "}
            <span className="font-extrabold text-ink" dir="ltr">
              {toPersianDigits(
                `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
              )}
            </span>
          </>
        ) : (
          <button
            onClick={resend}
            disabled={requestOtp.isPending}
            className="font-extrabold text-primary"
          >
            ارسال مجدد کد
          </button>
        )}
      </div>

      {/* Confirm */}
      <div className="mt-7">
        <button
          onClick={() => submit(digits.join(""))}
          disabled={digits.some((d) => !d) || verifyOtp.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-[15px] bg-ink py-4 text-[15.5px] font-extrabold text-white disabled:opacity-60"
        >
          {verifyOtp.isPending ? "در حال بررسی…" : "تأیید و ادامه"}
          {!verifyOtp.isPending && (
            <ChevronLeft size={18} strokeWidth={2} className="text-primary" />
          )}
        </button>
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
