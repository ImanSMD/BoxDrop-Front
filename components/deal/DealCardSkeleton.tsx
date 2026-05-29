import { Skeleton } from "@/components/ui/skeleton";

export function DealCardSkeleton() {
  return (
    <div className="mb-3 rounded-[20px] border border-line bg-white p-3.5">
      <div className="flex gap-3">
        <Skeleton className="h-[60px] w-[60px] shrink-0 rounded-[15px]" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-[22px] w-24 rounded-full" />
        </div>
      </div>
      <Skeleton className="mt-3 h-[5px] w-full rounded-full" />
      <div className="my-3 h-px bg-line" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-32 rounded-[11px]" />
      </div>
    </div>
  );
}
