/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const CardSkeleton = () => (
  <div className="group relative">
    <div className="h-[340px] overflow-hidden rounded-3xl border-[0.15rem] border-[#D6DFE6]  bg-[#F7F7F7]">
      <div className="space-y-4 pl-8 pr-8 pb-8">
        {/* Header shimmer */}
        <div className="flex items-start justify-between">
          <div className="flex cursor-pointer items-center gap-1 pt-8">
            <div className="h-2 w-2 animate-pulse rounded-lg bg-[#D9D9D9]" />
            <div className="h-2 w-2 animate-pulse rounded-lg bg-[#D9D9D9]" />
            <div className="h-2 w-2 animate-pulse rounded-lg bg-[#D9D9D9]" />
          </div>
          <div className="space-y-2 pt-16 mt-2">
            <div className="h-12 w-12 animate-pulse rounded-xl bg-[#D9D9D9]" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-full bg-[#D9D9D9] mt-4" />
        </div>

        {/* Title shimmer */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="h-5 w-1/2 animate-pulse rounded-lg bg-[#D9D9D9]" />
          <div className="h-3 w-1/2 animate-pulse rounded-lg bg-[#D9D9D9]" />
        </div>

        {/* Code block shimmer */}
        <div className="space-y-2 p-2 pt-5">
          <div className="h-8 w-full animate-pulse rounded-xl bg-[#D9D9D9]" />
          <div className="h-4 w-3/4 animate-pulse rounded-xl bg-[#D9D9D9] " />
          <div className="h-4 w-1/2 animate-pulse rounded-xl bg-[#D9D9D9]" />
        </div>
      </div>
    </div>
  </div>
);

export default function PageSkeleton() {
  return (
    <div className="min-h-screen w-full bg-transparent">
      {/* Hero Section Skeleton */}
      <div className="max-w-8xl relative mx-auto py-12">
        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i}>
              <CardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
