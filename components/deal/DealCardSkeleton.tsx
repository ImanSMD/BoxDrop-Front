import { Skeleton } from "@/components/ui/skeleton";

export function DealCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/50">
      <div className="flex gap-3">
        <Skeleton className="size-16 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      <Skeleton className="mt-3 h-2.5 w-full rounded-full" />
      <Skeleton className="mt-3 h-9 w-full rounded-xl" />
    </div>
  );
}
