"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, ChevronLeft, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe, useReferral } from "@/lib/hooks/useMe";
import { useLogout } from "@/lib/hooks/useAuth";
import { formatNumber } from "@/lib/format/number";
import { formatMoney } from "@/lib/format/money";
import type { DeliveryMethod } from "@/lib/api/types";

export default function ProfilePage() {
  const router = useRouter();
  const { data: me, isLoading } = useMe();
  const referral = useReferral();
  const logout = useLogout();
  const [delivery, setDelivery] = useState<DeliveryMethod>("courier");

  useEffect(() => {
    if (me) setDelivery(me.default_delivery);
  }, [me]);

  const copyCode = async () => {
    if (!me) return;
    await navigator.clipboard.writeText(me.referral_code);
    toast.success("کد دعوت کپی شد.");
  };

  const doLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (isLoading || !me) {
    return (
      <div className="space-y-4 p-5">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  const initial = me.full_name ? me.full_name.charAt(0) : "م";
  const referralLink =
    typeof window !== "undefined" ? `${window.location.origin}/login?ref=${me.referral_code}` : "";

  const menu1 = [
    { icon: "📍", label: "آدرس و منطقه", val: me.zone?.name ?? "", href: null },
    { icon: "🚚", label: "روش تحویل پیش‌فرض", val: delivery === "courier" ? "پیک" : "حضوری", href: null },
    { icon: "🔔", label: "اعلان‌ها", val: "", href: null },
    { icon: "📦", label: "ارسال‌های من", val: "", href: "/deliveries" },
  ];
  const menu2 = [
    { icon: "ℹ️", label: "پشتیبانی تلگرام", val: "", href: null },
    { icon: "🛡️", label: "قوانین و حریم خصوصی", val: "", href: null },
    { icon: "ℹ️", label: "درباره BoxDrop", val: "v۱.۰.۰", href: null },
  ];

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <div className="flex items-center border-b border-line px-[18px] pb-3 pt-5">
        <div className="w-10" />
        <h1 className="flex-1 text-center text-[16.5px] font-black text-ink">پروفایل</h1>
        <div className="w-10" />
      </div>

      {/* Avatar + name + edit */}
      <div className="flex items-center gap-3.5 px-[18px] py-[18px]">
        <div className="flex size-[58px] shrink-0 items-center justify-center rounded-[18px] bg-ink text-[24px] font-black text-white">
          {initial}
        </div>
        <div className="flex-1">
          <div className="text-[18px] font-black text-ink">
            {me.full_name || "کاربر باکس‌دراپ"}
          </div>
          <div className="mt-0.5 text-[12px] text-mut" dir="ltr">
            {me.phone}
          </div>
        </div>
        <button className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-primary">
          ✏️ ویرایش
        </button>
      </div>

      {/* Stats chips */}
      <div className="flex gap-2.5 border-b-[8px] border-surface px-4 pb-4">
        {[
          [formatMoney(referral.data?.total_referral_cashback ?? 0), "کل صرفه‌جویی"],
          [formatNumber(23), "دیل تکمیل‌شده"],
          [`${formatNumber(2)} بار`, "قهرمان حجم"],
        ].map(([val, label], i) => (
          <div
            key={i}
            className="flex-1 rounded-[14px] bg-surface px-3 py-3 text-center"
          >
            <div className="text-[15px] font-black tracking-tight text-ink">{val}</div>
            <div className="mt-1 text-[10.5px] font-semibold text-mut">{label}</div>
          </div>
        ))}
      </div>

      {/* Dark referral card */}
      <div className="mx-4 my-4 rounded-[20px] bg-dark px-[18px] pb-4 pt-[18px]">
        <div className="mb-1 flex items-center gap-2">
          <span>🎁</span>
          <span className="text-[15px] font-black text-white">دوستاتو دعوت کن</span>
        </div>
        <p className="mb-3.5 text-[11.5px] leading-relaxed text-[#A1A1AA]">
          هر دوست که با کد تو ثبت‌نام کنه و به دیل بپیونده، هر دو ۲٪ کش‌بک می‌گیرید.
        </p>
        {/* Referral code box */}
        <div
          className="mb-3.5 flex items-center justify-between rounded-[13px] px-4 py-3"
          style={{
            background: "rgba(255,255,255,.08)",
            border: "1.5px dashed rgba(255,255,255,.28)",
          }}
        >
          <span
            dir="ltr"
            className="font-mono text-[18px] font-black tracking-widest text-white"
          >
            {me.referral_code}
          </span>
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 text-[12px] font-extrabold text-primary"
          >
            <Copy size={15} strokeWidth={2} />
            کپی
          </button>
        </div>
        {/* Share buttons */}
        <div className="flex gap-2">
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center rounded-[11px] bg-white py-2.5 text-[12px] font-extrabold text-primary"
          >
            تلگرام
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center rounded-[11px] bg-white py-2.5 text-[12px] font-extrabold text-[#108A52]"
          >
            واتساپ
          </a>
        </div>
      </div>

      {/* Settings menu */}
      <MenuSection title="تنظیمات" items={menu1} router={router} />
      <MenuSection title="پشتیبانی" items={menu2} router={router} />

      {/* Logout */}
      <div className="px-4 pb-7 pt-4">
        <button
          onClick={doLogout}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-surface py-4 text-sm font-extrabold"
          style={{ color: "#C2410C" }}
        >
          <LogOut size={18} strokeWidth={2} color="#C2410C" />
          خروج از حساب
        </button>
      </div>
    </div>
  );
}

type MenuItem = { icon: string; label: string; val: string; href: string | null };

function MenuSection({
  title,
  items,
  router,
}: {
  title: string;
  items: MenuItem[];
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <>
      <h3 className="mx-[18px] mb-2.5 mt-1 text-[13px] font-black text-mut">
        {title}
      </h3>
      <div className="mx-4 overflow-hidden rounded-[16px] border border-line">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => item.href && router.push(item.href)}
            className={`flex w-full items-center gap-3 px-4 py-3.5 text-right ${
              i < items.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="flex-1 text-[13.5px] font-bold text-ink">
              {item.label}
            </span>
            {item.val && (
              <span className="text-[12.5px] font-semibold text-mut">
                {item.val}
              </span>
            )}
            <ChevronLeft size={15} strokeWidth={2} className="text-mut" />
          </button>
        ))}
      </div>
    </>
  );
}
