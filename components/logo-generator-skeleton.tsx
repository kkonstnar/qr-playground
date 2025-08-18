export function LogoGeneratorSkeleton() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-6 w-24 bg-neutral-700/50 rounded animate-pulse" />
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-neutral-700/50 rounded animate-pulse" />
            <div className="h-6 w-11 bg-neutral-700/50 rounded-full animate-pulse" />
            <div className="h-4 w-4 bg-neutral-700/50 rounded animate-pulse" />
          </div>
        </div>

        {/* Font controls row skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-10 bg-neutral-700/50 rounded-md animate-pulse" />
          <div className="w-32 h-10 bg-neutral-700/50 rounded-md animate-pulse" />
          <div className="flex items-center space-x-2">
            <div className="h-6 w-11 bg-neutral-700/50 rounded-full animate-pulse" />
            <div className="h-4 w-4 bg-neutral-700/50 rounded animate-pulse" />
          </div>
          <div className="h-8 w-8 bg-neutral-700/50 rounded animate-pulse" />
          <div className="h-8 w-8 bg-neutral-700/50 rounded animate-pulse" />
        </div>

        {/* Text preview skeleton */}
        <div className="mb-8 p-8 rounded-lg border-2 border-dashed border-neutral-700/50">
          <div className="h-16 w-3/4 mx-auto bg-neutral-700/50 rounded animate-pulse" />
        </div>

        {/* Controls row skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-1">
            <div className="h-8 w-8 bg-neutral-700/50 rounded animate-pulse" />
            <div className="h-8 w-8 bg-neutral-700/50 rounded animate-pulse" />
            <div className="h-8 w-8 bg-neutral-700/50 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-neutral-700/50 rounded animate-pulse" />
              <div className="h-8 w-20 bg-neutral-700/50 rounded animate-pulse" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-neutral-700/50 rounded animate-pulse" />
              <div className="h-8 w-20 bg-neutral-700/50 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Sliders skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <div className="h-4 w-8 bg-neutral-700/50 rounded animate-pulse" />
            <div className="h-2 w-full bg-neutral-700/50 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-neutral-700/50 rounded animate-pulse" />
            <div className="h-2 w-full bg-neutral-700/50 rounded animate-pulse" />
          </div>
        </div>

        {/* Download button skeleton */}
        <div className="flex justify-center">
          <div className="h-10 w-32 bg-neutral-700/50 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
