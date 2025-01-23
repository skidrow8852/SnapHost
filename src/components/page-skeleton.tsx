/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const CardSkeleton = () => (
  <div className="relative group">
    <div className="bg-[#F7F7F7] rounded-2xl border border-[#D6DFE6] overflow-hidden h-[280px]">
      <div className="p-5 space-y-4">
        {/* Header shimmer */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-lg bg-[#D9D9D9] animate-pulse" />
            <div className="w-2 h-2 rounded-lg bg-[#D9D9D9] animate-pulse" />
            <div className="w-2 h-2 rounded-lg bg-[#D9D9D9] animate-pulse" />
            
          </div>
          <div className="space-y-2 pt-8">
              <div className="w-10 h-10 bg-[#D9D9D9] rounded-xl animate-pulse" />
            </div>
          <div className="w-10 h-10  bg-[#D9D9D9] rounded-full animate-pulse" />
        </div>

        {/* Title shimmer */}
        <div className="space-y-2 flex justify-center flex-col items-center">
          <div className="w-1/2 h-5 bg-[#D9D9D9] rounded-lg animate-pulse" />
          <div className="w-1/2 h-3 bg-[#D9D9D9] rounded-lg animate-pulse" />
        </div>

        {/* Code block shimmer */}
        <div className="space-y-2  p-2">
          <div className="w-full h-8 bg-[#D9D9D9] rounded-xl animate-pulse" />
          <div className="w-3/4 h-4 bg-[#D9D9D9] rounded-xl animate-pulse" />
          <div className="w-1/2 h-4 bg-[#D9D9D9] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

export default function PageSkeleton() {
  return (
    <div className="min-h-screen w-full bg-transparent">


      {/* Hero Section Skeleton */}
      <div className="relative max-w-8xl mx-auto  py-12">


        {/* Grid Skeleton */}
      <div
  className="
    grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10
  "
>
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