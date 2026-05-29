import { formatNumber } from "./number";

/** Short Toman suffix used across the app (CLAUDE.md §3). */
export const TOMAN_SHORT = "ت";
export const TOMAN_LONG = "تومان";

/**
 * Format an integer Toman amount for display.
 * Backend sends integer Toman (CLAUDE.md §8).
 *
 * formatMoney(17000) => "۱۷,۰۰۰ ت"
 */
export function formatMoney(toman: number, long = false): string {
  return `${formatNumber(toman)} ${long ? TOMAN_LONG : TOMAN_SHORT}`;
}
