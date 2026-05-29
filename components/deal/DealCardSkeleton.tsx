import { Skeleton } from "@/components/ui/skeleton";

export function DealCardSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-line py-4">
      <Skeleton className="h-[62px] w-[62px] shrink-0 rounded-[15px]" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-[5px] w-full rounded-full" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}
