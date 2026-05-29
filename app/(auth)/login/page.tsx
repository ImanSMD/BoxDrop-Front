"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRequestOtp } from "@/lib/hooks/useAuth";
import { toEnglishDigits } from "@/lib/format/number";

const schema = z.object({
  phone: z
    .string()
    .transform((v) => toEnglishDigits(v).replace(/\s/g, ""))
    .pipe(
      z
        .string()
        .regex(/^09\d{9}$/, "شماره موبایل را درست وارد کنید."),
    ),
});

type FormValues = { phone: string };

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const ref = params.get("ref") ?? "";
  const requestOtp = useRequestOtp();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const local = toEnglishDigits(values.phone).replace(/\s/g, "");
    const e164 = `+98${local.slice(1)}`;
    try {
      await requestOtp.mutateAsync(e164);
      const q = new URLSearchParams({ phone: e164 });
      if (ref) q.set("ref", ref);
      router.push(`/verify?${q.toString()}`);
    } catch {
      setServerError("ارسال کد ناموفق بود. دوباره تلاش کنید.");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col pt-3">
      {/* Back button */}
      <div className="pb-1 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center rounded-[12px] bg-surface"
        >
          <ChevronRight size={20} strokeWidth={2} className="text-ink" />
        </button>
      </div>

      {/* Headline */}
      <div className="pb-7 pt-6">
        <h1 className="text-[25px] font-black leading-[1.35] tracking-[-0.4px] text-ink">
          به BoxDrop<br />خوش اومدی
        </h1>
        <p className="mt-2.5 text-[13.5px] leading-7 text-mut">
          شماره موبایلت رو وارد کن تا کد تأیید برات بفرستیم.
        </p>
      </div>

      {/* Phone field */}
      <div className="mb-5">
        <label className="mb-2 block text-[12.5px] font-extrabold text-mut">
          شماره موبایل
        </label>
        <div
          dir="ltr"
          className="flex items-center rounded-[14px] border-[1.5px] border-primary bg-surface px-4"
        >
          <span className="border-l border-line py-4 pl-2.5 pr-0 text-[15px] font-extrabold text-mut">
            +98
          </span>
          <input
            {...register("phone")}
            inputMode="numeric"
            autoComplete="tel"
            placeholder="912 345 6789"
            className="flex-1 bg-transparent py-4 ps-3 text-left text-[15.5px] font-bold text-ink outline-none placeholder:text-[#BFBFC6]"
          />
        </div>
        {(errors.phone || serverError) && (
          <p className="mt-2 text-[12px] text-danger">
            {errors.phone?.message ?? serverError}
          </p>
        )}
      </div>

      {/* CTA — ink button + orange arrow (Bold Mono pattern) */}
      <button
        type="submit"
        disabled={requestOtp.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-[15px] bg-ink py-4 text-[15.5px] font-extrabold text-white disabled:opacity-60"
      >
        {requestOtp.isPending ? "در حال ارسال…" : "ارسال کد تأیید"}
        {!requestOtp.isPending && (
          <ChevronLeft size={18} strokeWidth={2} className="text-primary" />
        )}
      </button>

      <div className="mt-auto pb-9 pt-6 text-center text-[11.5px] leading-7 text-mut">
        با ادامه، با{" "}
        <span className="font-extrabold text-primary">قوانین و حریم خصوصی</span>{" "}
        BoxDrop موافقت می‌کنی.
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
