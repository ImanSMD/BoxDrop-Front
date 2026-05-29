import type { OrderStatus } from "@/lib/api/types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  joined: "پیوستی",
  locked: "قفل شد",
  preparing: "در حال آماده‌سازی",
  out_for_delivery: "در مسیر ارسال",
  delivered: "تحویل شد",
  canceled: "لغو شد",
};

/** Tailwind classes for an order status pill. */
export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  joined: "bg-accent/15 text-primary-dark",
  locked: "bg-primary/10 text-primary",
  preparing: "bg-accent/15 text-[#B7791F]",
  out_for_delivery: "bg-tier-bronze/10 text-tier-bronze",
  delivered: "bg-success/10 text-success",
  canceled: "bg-danger/10 text-danger",
};

const PAST: OrderStatus[] = ["delivered", "canceled"];

export const isPastOrder = (status: OrderStatus) => PAST.includes(status);
