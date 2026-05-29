"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useUpdateMe } from "@/lib/hooks/useMe";
import type { DeliveryMethod, User } from "@/lib/api/types";

const DELIVERY_OPTIONS: { value: DeliveryMethod; label: string }[] = [
  { value: "courier", label: "پیک" },
  { value: "pickup", label: "حضوری" },
];

export function EditProfileDrawer({
  open,
  onOpenChange,
  me,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  me: User;
}) {
  const update = useUpdateMe();
  const [fullName, setFullName] = useState(me.full_name ?? "");
  const [address, setAddress] = useState(me.address ?? "");
  const [delivery, setDelivery] = useState<DeliveryMethod>(me.default_delivery);

  // Reset local fields whenever the drawer opens with fresh user data.
  useEffect(() => {
    if (open) {
      setFullName(me.full_name ?? "");
      setAddress(me.address ?? "");
      setDelivery(me.default_delivery);
    }
  }, [open, me.full_name, me.address, me.default_delivery]);

  const save = async () => {
    try {
      await update.mutateAsync({
        full_name: fullName.trim(),
        address: address.trim(),
        default_delivery: delivery,
      });
      onOpenChange(false);
    } catch {
      // error toast handled in hook
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent dir="rtl" className="mx-auto max-w-md rounded-t-[26px]">
        <div dir="rtl" className="px-5 pb-7 pt-1 font-sans">
          <DrawerHeader className="p-0 mb-4">
            <DrawerTitle className="text-right text-[16.5px] font-black text-ink">
              ویرایش اطلاعات
            </DrawerTitle>
          </DrawerHeader>

          {/* Full name */}
          <label className="mb-2 block text-[12.5px] font-extrabold text-mut">
            اسم و فامیل
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="مثلاً متین احمدی"
            className="w-full rounded-[14px] border-[1.5px] border-transparent bg-surface px-4 py-3.5 text-[15px] font-semibold text-ink outline-none focus:border-primary focus:bg-white"
          />

          {/* Address */}
          <label className="mb-2 mt-4 block text-[12.5px] font-extrabold text-mut">
            آدرس کامل
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="خیابان ولیعصر، کوچه ۱۲، پلاک ۸، واحد ۳"
            className="w-full rounded-[14px] border-[1.5px] border-transparent bg-surface px-4 py-3.5 text-[15px] font-semibold text-ink outline-none focus:border-primary focus:bg-white"
          />

          {/* Default delivery method */}
          <span className="mb-2.5 mt-4 block text-[12.5px] font-extrabold text-mut">
            روش تحویل پیش‌فرض
          </span>
          <div className="flex gap-2.5">
            {DELIVERY_OPTIONS.map((opt) => {
              const on = delivery === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDelivery(opt.value)}
                  className="flex-1 rounded-[13px] py-3.5 text-[14px] font-extrabold transition-colors"
                  style={{
                    background: on ? "#FFFFFF" : "#F4F4F5",
                    border: `1.5px solid ${on ? "#111114" : "transparent"}`,
                    color: on ? "#111114" : "#71717A",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Save */}
          <button
            onClick={save}
            disabled={update.isPending}
            className="mt-6 w-full rounded-[15px] bg-ink py-4 text-[15px] font-extrabold text-white disabled:opacity-60"
          >
            {update.isPending ? "در حال ذخیره…" : "ذخیره تغییرات"}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
