const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Convert every ASCII digit in a string to its Persian numeral. */
export function toPersianDigits(input: string): string {
  return input.replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/** Convert Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII. */
export function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

export type FormatNumberOptions = {
  /** Group thousands with a comma separator. Default: true. */
  grouping?: boolean;
};

/**
 * Format a number for display in Persian numerals.
 * Every number rendered in the UI MUST pass through this (CLAUDE.md §3, §12).
 *
 * formatNumber(17000) => "۱۷,۰۰۰"
 * formatNumber(29)     => "۲۹"
 */
export function formatNumber(
  value: number | string,
  { grouping = true }: FormatNumberOptions = {},
): string {
  if (value === null || value === undefined || value === "") return "";

  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) {
    // Not numeric — still localize any digits present (e.g. a phone number).
    return toPersianDigits(String(value));
  }

  const negative = num < 0;
  const abs = Math.abs(num);
  const [intPart, decPart] = String(abs).split(".");

  const groupedInt = grouping
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : intPart;

  const assembled = decPart ? `${groupedInt}.${decPart}` : groupedInt;
  return (negative ? "-" : "") + toPersianDigits(assembled);
}
