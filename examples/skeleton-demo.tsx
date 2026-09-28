import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonDemo() {
  return (
    <div className="flex w-full max-w-xs items-center gap-3">
      <div className="size-9 overflow-hidden rounded-full">
        <Skeleton className="size-full" />
      </div>
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
