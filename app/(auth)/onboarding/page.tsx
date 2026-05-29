"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Map } from "lucide-react";
import { useZones } from "@/lib/hooks/useCatalog";
import { useUpdateMe } from "@/lib/hooks/useMe";
import type { GeoPin } from "@/lib/api/types";

const schema = z.object({
  full_name: z.string().min(2, "نام و نام خانوادگی را وارد کنید."),
  address: z.string().min(5, "نشانی را کامل‌تر وارد کنید."),
});
type FormValues = z.infer<typeof schema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { data: zones } = useZones();
  const updateMe = useUpdateMe();
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [pin, setPin] = useState<GeoPin | null>(null);
  const [zoneError, setZoneError] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const capturePin = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setPin({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setPin({ lat: 35.759, lng: 51.409 }),
    );
  };

  const ZONE_COLOR: Record<string, string> = {
    vanak: "#7C5CFF", ponak: "#0E9FD8", niavaran: "#0FA968",
    saadatabad: "#E8902B", jordan: "#E0533A",
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!zoneId) { setZoneError(true); return; }
    await updateMe.mutateAsync({
      full_name: values.full_name,
      address: values.address,
      zone_id: zoneId,
      address_pin: pin,
    });
    router.replace("/");
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col pt-3">
      {/* Progress bar (2 of 3 steps done) */}
      <div className="flex gap-1.5 pb-6 pt-3.5">
        {[true, true, false].map((done, i) => (
          <div
            key={i}
            className="h-[5px] flex-1 rounded-full"
            style={{ background: done ? "#FF5A1F" : "#ECECEE" }}
          />
        ))}
      </div>

      <h1 className="text-[23px] font-black tracking-[-0.4px] text-ink">
        یه‌کم بهتر بشناسیمت
      </h1>
      <p className="mt-2 text-[13px] leading-7 text-mut">
        برای ارسال درست محصول‌ها این اطلاعات رو ازت می‌خوایم.
      </p>

      <div className="mt-6 space-y-4">
        {/* Full name */}
        <Field label="اسم و فامیل">
          <input
            {...register("full_name")}
            placeholder="مثلاً متین احمدی"
            className={inputCls}
          />
          {errors.full_name && <Err>{errors.full_name.message}</Err>}
        </Field>

        {/* Zone picker — 2-col grid */}
        <div>
          <label className="mb-2.5 block text-[12.5px] font-extrabold text-mut">
            منطقه‌ات کجاست؟
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {zones?.map((z) => {
              const on = z.id === zoneId;
              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => { setZoneId(z.id); setZoneError(false); }}
                  className="flex items-center gap-2.5 rounded-[13px] px-3.5 py-3.5 text-left transition-colors"
                  style={{
                    background: on ? "#FFFFFF" : "#F4F4F5",
                    border: `1.5px solid ${on ? "#111114" : "transparent"}`,
                  }}
                >
                  <span
                    className="size-[11px] shrink-0 rounded-full"
                    style={{ background: ZONE_COLOR[z.id] ?? "#A1A1AA" }}
                  />
                  <span className="text-[13.5px] font-extrabold text-ink">
                    {z.name}
                  </span>
                </button>
              );
            })}
          </div>
          {zoneError && <Err>منطقه را انتخاب کنید.</Err>}
        </div>

        {/* Address */}
        <Field label="آدرس کامل">
          <input
            {...register("address")}
            placeholder="خیابان ولیعصر، کوچه ۱۲، پلاک ۸، واحد ۳"
            className={inputCls}
          />
          {errors.address && <Err>{errors.address.message}</Err>}
        </Field>

        {/* Map pin */}
        <button
          type="button"
          onClick={capturePin}
          className="flex w-full cursor-pointer items-center gap-3 rounded-[14px] bg-surface px-4 py-3.5"
        >
          <Map size={22} strokeWidth={1.8} className="text-primary" />
          <div className="flex-1 text-right">
            <div className="text-[13px] font-extrabold text-ink">
              پین روی نقشه{" "}
              <span className="font-semibold text-mut">(اختیاری)</span>
            </div>
            <div className="text-[11.5px] text-mut">
              {pin ? "موقعیت ثبت شد ✓" : "برای پیدا کردن دقیق‌تر آدرس به پیک"}
            </div>
          </div>
          <ChevronLeft size={16} strokeWidth={2} className="text-mut" />
        </button>
      </div>

      <div className="mt-auto pb-8 pt-6">
        <button
          type="submit"
          disabled={updateMe.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-[15px] bg-ink py-4 text-[15.5px] font-extrabold text-white disabled:opacity-60"
        >
          {updateMe.isPending ? "در حال ذخیره…" : "شروع خرید"}
          {!updateMe.isPending && (
            <ChevronLeft size={18} strokeWidth={2} className="text-primary" />
          )}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-[14px] border-[1.5px] border-transparent bg-surface px-4 py-4 text-[15px] font-semibold text-ink outline-none focus:border-primary focus:bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-[12.5px] font-extrabold text-mut">{label}</label>
      {children}
    </div>
  );
}

function Err({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[12px] text-danger">{children}</p>;
}
