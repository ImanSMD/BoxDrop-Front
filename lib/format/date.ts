import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import jalaliday from "jalaliday";
import { toPersianDigits } from "./number";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(jalaliday);

export const TEHRAN_TZ = "Asia/Tehran";

const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

/** Parse an ISO UTC string into a Tehran-local dayjs instance. */
function tehran(iso: string) {
  return dayjs.utc(iso).tz(TEHRAN_TZ);
}

/**
 * ISO UTC -> Jalali date in Tehran time, Persian numerals.
 * formatJalaliDate("2026-06-06T...") => "۱۶ خرداد ۱۴۰۵"
 */
export function formatJalaliDate(iso: string): string {
  const d = tehran(iso);
  const j = d.calendar("jalali");
  const day = toPersianDigits(String(j.date()));
  const month = JALALI_MONTHS[j.month()];
  const year = toPersianDigits(String(j.year()));
  return `${day} ${month} ${year}`;
}

/** ISO UTC -> "HH:mm" in Tehran time, Persian numerals. */
export function formatTehranTime(iso: string): string {
  return toPersianDigits(tehran(iso).format("HH:mm"));
}

/** ISO UTC -> "۱۶ خرداد ۱۴۰۵، ۱۴:۳۰" */
export function formatJalaliDateTime(iso: string): string {
  return `${formatJalaliDate(iso)}، ${formatTehranTime(iso)}`;
}

export type Countdown = {
  total: number; // milliseconds remaining (clamped at 0)
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

/** Time remaining until a deadline (ISO UTC), relative to `now`. */
export function getCountdown(iso: string, now: number = Date.now()): Countdown {
  const total = Math.max(0, dayjs.utc(iso).valueOf() - now);
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds, expired: total <= 0 };
}

/**
 * Compact Persian countdown label for deal deadlines.
 * "۲ روز و ۴ ساعت" / "۳ ساعت و ۱۲ دقیقه" / "۸ دقیقه" / "پایان یافته"
 */
export function formatCountdown(iso: string, now: number = Date.now()): string {
  const c = getCountdown(iso, now);
  if (c.expired) return "پایان یافته";
  const fa = (n: number) => toPersianDigits(String(n));
  if (c.days > 0) return `${fa(c.days)} روز و ${fa(c.hours)} ساعت`;
  if (c.hours > 0) return `${fa(c.hours)} ساعت و ${fa(c.minutes)} دقیقه`;
  return `${fa(c.minutes)} دقیقه`;
}
