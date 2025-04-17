
import { Skeleton } from "@/components/ui/skeleton";

export function ReservationLoadingState() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Skeleton className="h-12 w-3/4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[200px]" />
      </div>
      <Skeleton className="h-[100px]" />
    </div>
  );
}
