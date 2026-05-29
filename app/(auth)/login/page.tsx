"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useRequestOtp } from "@/lib/hooks/useAuth";
import { toEnglishDigits } from "@/lib/format/number";

const schema = z.object({
  phone: z
    .string()
    .transform((v) => toEnglishDigits(v).replace(/\s/g, ""))
    .pipe(
      z
        .string()
        .regex(/^09\d{9}$/, "شماره موبایل را درست وارد کنید (مثل ۰۹۱۲۳۴۵۶۷۸۹)."),
    ),
});

type FormValues = { phone: string };

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const ref = params.get("ref") ?? "";
  const requestOtp = useRequestOtp();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

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
    <form onSubmit={onSubmit} className="flex flex-1 flex-col">
      <div className="mb-8 mt-6">
        <div className="mb-4 text-5xl">📦</div>
        <h1 className="text-2xl font-black leading-relaxed text-ink">
          خوش اومدی به باکس‌دراپ
        </h1>
        <p className="mt-2 leading-7 text-muted-foreground">
          شماره موبایلت رو وارد کن تا کد تأیید برات بفرستیم.
        </p>
      </div>

      <label className="mb-2 block text-sm font-bold text-ink">
        شماره موبایل
      </label>
      <div
        dir="ltr"
        className="flex items-center rounded-2xl border-2 border-transparent bg-surface px-4 focus-within:border-primary focus-within:bg-card"
      >
        <span className="py-4 pe-2 font-bold text-muted-foreground">+۹۸</span>
        <input
          {...register("phone")}
          inputMode="numeric"
          autoComplete="tel"
          placeholder="0912 345 6789"
          className="flex-1 bg-transparent py-4 text-left text-base outline-none"
        />
      </div>
      {(errors.phone || serverError) && (
        <p className="mt-2 text-sm text-danger">
          {errors.phone?.message ?? serverError}
        </p>
      )}

      <div className="mt-auto pt-6">
        <Button
          type="submit"
          disabled={requestOtp.isPending}
          className="h-14 w-full rounded-2xl bg-primary text-base font-extrabold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
        >
          {requestOtp.isPending ? "در حال ارسال…" : "ارسال کد"}
        </Button>
        <p className="mt-4 text-center text-xs leading-6 text-muted-foreground">
          با ادامه، قوانین و حریم خصوصی باکس‌دراپ را می‌پذیری.
        </p>
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
