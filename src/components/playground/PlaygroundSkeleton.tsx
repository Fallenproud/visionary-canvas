import { Skeleton } from "@/components/ui/skeleton";

export const PlaygroundSkeleton = () => (
  <div className="h-screen flex flex-col bg-background">
    {/* Top bar skeleton */}
    <div className="h-12 border-b border-border/40 flex items-center px-3 gap-2 shrink-0 bg-card/60">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <Skeleton className="w-px h-5" />
      <Skeleton className="w-24 h-6 rounded-md" />
      <div className="flex-1" />
      <Skeleton className="w-32 h-6 rounded-md" />
      <div className="flex-1" />
      <Skeleton className="w-20 h-6 rounded-md" />
    </div>

    {/* 2-pane skeleton */}
    <div className="flex-1 flex overflow-hidden">
      {/* Chat pane */}
      <div className="w-[38%] border-r border-border/30 flex flex-col p-4 gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="w-20 h-4 rounded" />
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="w-3/4 h-12 rounded-2xl" />
          <Skeleton className="w-1/2 h-8 rounded-2xl ml-auto" />
          <Skeleton className="w-2/3 h-16 rounded-2xl" />
          <Skeleton className="w-1/3 h-8 rounded-2xl ml-auto" />
        </div>
        <Skeleton className="w-full h-14 rounded-2xl" />
      </div>

      {/* Preview pane */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Skeleton className="w-[320px] h-[580px] rounded-[2.5rem]" />
      </div>
    </div>
  </div>
);
