import { Skeleton } from "@/components/ui/skeleton";

export default function loading() {
  return (
    <>
      <h1 className="text-4xl font-black mb-4">Subscription Plans</h1>
      <div className="pt-3 pb-2 space-y-4 mt-12 border rounded-md border-gray-300 ">
        {/* Table header skeleton */}
        <div className="pl-2 pr-2 grid grid-cols-[200px_450px_100px] gap-6 border-b pb-3">
          <Skeleton className="h-2.5 w-40 bg-gray-300" />
          <Skeleton className="h-2.5 w-10 bg-gray-300" />
          <Skeleton className="h-2.5 w-20 bg-gray-300" />
        </div>

        {/* Table rows skeleton */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid pl-2 pr-2 grid-cols-[200px_450px_100px] gap-6"
          >
            <Skeleton className="h-2.5 w-full bg-gray-300" />
            <Skeleton className="h-2.5 w-25 bg-gray-300" />
            <Skeleton className="h-2.5 w-10 bg-gray-300" />
          </div>
        ))}
      </div>
    </>
  );
}
