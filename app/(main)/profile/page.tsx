"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, LogOut, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe, useReferral, useUpdateMe } from "@/lib/hooks/useMe";
import { useLogout } from "@/lib/hooks/useAuth";
import { formatNumber, toPersianDigits } from "@/lib/format/number";
import { formatMoney } from "@/lib/format/money";
import type { DeliveryMethod } from "@/lib/api/types";

export default function ProfilePage() {
  const router = useRouter();
  const { data: me, isLoading } = useMe();
  const referral = useReferral();
  const updateMe = useUpdateMe();
  const logout = useLogout();

  const [fullName, setFullName] = useState("");
  const [delivery, setDelivery] = useState<DeliveryMethod>("courier");

  useEffect(() => {
    if (me) {
      setFullName(me.full_name);
      setDelivery(me.default_delivery);
    }
  }, [me]);

  const referralLink =
    typeof window !== "undefined" && me
      ? `${window.location.origin}/login?ref=${me.referral_code}`
      : "";
  const shareText = `با کد دعوت من «${me?.referral_code ?? ""}» تو باکس‌دراپ ثبت‌نام کن و با هم عمده بخریم! ${referralLink}`;

  const copyCode = async () => {
    if (!me) return;
    await navigator.clipboard.writeText(me.referral_code);
    toast.success("کد دعوت کپی شد.");
  };

  const save = () =>
    updateMe.mutate({ full_name: fullName, default_delivery: delivery });

  const doLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (isLoading || !me) {
    return (
      <div className="space-y-4 p-5">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 bg-card px-5 pb-5 pt-6">
        <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-black text-white">
          {me.full_name ? me.full_name.charAt(0) : "👤"}
        </div>
        <div>
          <div className="text-lg font-black text-ink">
            {me.full_name || "کاربر باکس‌دراپ"}
          </div>
          <div dir="ltr" className="text-sm text-muted-foreground">
            {toPersianDigits(me.phone)}
          </div>
        </div>
      </div>

      {/* Referral */}
      <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-br from-accent to-primary p-5 text-white">
        <div className="text-sm font-bold opacity-90">کد دعوت تو</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-3xl font-black tracking-wider" dir="ltr">
            {me.referral_code}
          </span>
          <button
            onClick={copyCode}
            className="rounded-full bg-white/20 p-2"
            aria-label="کپی کد"
          >
            <Copy className="size-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2 text-xs">
          <div className="flex-1 rounded-xl bg-white/15 px-3 py-2">
            <span className="block opacity-80">دعوت‌شده‌ها</span>
            <strong>{formatNumber(referral.data?.invited_count ?? 0)} نفر</strong>
          </div>
          <div className="flex-1 rounded-xl bg-white/15 px-3 py-2">
            <span className="block opacity-80">کش‌بک معرفی</span>
            <strong>
              {formatMoney(referral.data?.total_referral_cashback ?? 0)}
            </strong>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-xs font-extrabold text-primary"
          >
            <Send className="size-4" /> تلگرام
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-xs font-extrabold text-success"
          >
            واتساپ
          </a>
        </div>
      </div>

      {/* Edit info */}
      <div className="mx-4 mt-3 space-y-4 rounded-2xl bg-card p-5">
        <h2 className="font-extrabold text-ink">ویرایش اطلاعات</h2>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
            نام و نام خانوادگی
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-2xl border-2 border-transparent bg-surface px-4 py-3 text-base outline-none focus:border-primary focus:bg-card"
          />
        </div>
        <div>
          <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
            روش تحویل پیش‌فرض
          </span>
          <div className="flex gap-2">
            {(
              [
                { v: "courier", l: "پیک" },
                { v: "pickup", l: "حضوری" },
              ] as { v: DeliveryMethod; l: string }[]
            ).map((opt) => (
              <button
                key={opt.v}
                onClick={() => setDelivery(opt.v)}
                className={`flex-1 rounded-2xl border-2 py-3 text-sm font-bold ${
                  delivery === opt.v
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent bg-surface text-ink"
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>
        <Button
          onClick={save}
          disabled={updateMe.isPending}
          className="h-12 w-full rounded-2xl bg-primary font-extrabold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
        >
          {updateMe.isPending ? "در حال ذخیره…" : "ذخیره تغییرات"}
        </Button>
      </div>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={doLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-danger/10 py-3.5 text-sm font-extrabold text-danger"
        >
          <LogOut className="size-4" />
          خروج از حساب
        </button>
      </div>
    </div>
  );
}
