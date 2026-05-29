"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  const [zoneOpen, setZoneOpen] = useState(false);
  const [pin, setPin] = useState<GeoPin | null>(null);
  const [zoneError, setZoneError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const selectedZone = zones?.find((z) => z.id === zoneId);

  const capturePin = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setPin({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setPin({ lat: 35.759, lng: 51.409 }),
    );
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!zoneId) {
      setZoneError(true);
      return;
    }
    await updateMe.mutateAsync({
      full_name: values.full_name,
      address: values.address,
      zone_id: zoneId,
      address_pin: pin,
    });
    router.replace("/");
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col">
      <div className="mb-6 mt-4">
        <h1 className="text-2xl font-black text-ink">تکمیل پروفایل</h1>
        <p className="mt-2 leading-7 text-muted-foreground">
          برای نمایش دیل‌های منطقه‌ات، چند تا اطلاعات لازم داریم.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-bold text-ink">
            نام و نام خانوادگی
          </label>
          <input
            {...register("full_name")}
            placeholder="مثلاً متین رضایی"
            className="w-full rounded-2xl border-2 border-transparent bg-surface px-4 py-4 text-base outline-none focus:border-primary focus:bg-card"
          />
          {errors.full_name && (
            <p className="mt-2 text-sm text-danger">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-ink">منطقه</label>
          <Dialog open={zoneOpen} onOpenChange={setZoneOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="w-full rounded-2xl border-2 border-transparent bg-surface px-4 py-4 text-right text-base text-ink focus:border-primary"
              >
                {selectedZone ? selectedZone.name : "انتخاب منطقه"}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-sm rounded-2xl" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">منطقه‌ات را انتخاب کن</DialogTitle>
              </DialogHeader>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {zones?.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => {
                      setZoneId(z.id);
                      setZoneError(false);
                      setZoneOpen(false);
                    }}
                    className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3 text-sm font-bold ${
                      zoneId === z.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent bg-surface text-ink"
                    }`}
                  >
                    {z.name}
                    {zoneId === z.id && <Check className="size-4" />}
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          {zoneError && (
            <p className="mt-2 text-sm text-danger">منطقه را انتخاب کنید.</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-ink">نشانی</label>
          <textarea
            {...register("address")}
            rows={3}
            placeholder="خیابان، کوچه، پلاک، واحد"
            className="w-full resize-none rounded-2xl border-2 border-transparent bg-surface px-4 py-4 text-base outline-none focus:border-primary focus:bg-card"
          />
          {errors.address && (
            <p className="mt-2 text-sm text-danger">{errors.address.message}</p>
          )}
        </div>

        <button
          type="button"
          onClick={capturePin}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3 text-sm font-bold ${
            pin ? "border-success text-success" : "border-border text-muted-foreground"
          }`}
        >
          <MapPin className="size-4" />
          {pin ? "موقعیت ثبت شد" : "افزودن موقعیت روی نقشه (اختیاری)"}
        </button>
      </div>

      <div className="mt-auto pt-6">
        <Button
          type="submit"
          disabled={updateMe.isPending}
          className="h-14 w-full rounded-2xl bg-primary text-base font-extrabold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
        >
          {updateMe.isPending ? "در حال ذخیره…" : "بزن بریم"}
        </Button>
      </div>
    </form>
  );
}
