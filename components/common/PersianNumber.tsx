import { formatNumber } from "@/lib/format/number";

type PersianNumberProps = {
  value: number | string;
  grouping?: boolean;
  className?: string;
};

/** Render a number in Persian numerals. Thin display wrapper over formatNumber. */
export function PersianNumber({
  value,
  grouping = true,
  className,
}: PersianNumberProps) {
  return (
    <span className={className}>{formatNumber(value, { grouping })}</span>
  );
}
