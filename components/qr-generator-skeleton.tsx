export function QRGeneratorSkeleton() {
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

        {/* Input skeleton */}
        <div className="mb-8">
          <div className="h-4 w-16 bg-neutral-700/50 rounded animate-pulse mb-2" />
          <div className="h-10 w-full bg-neutral-700/50 rounded-md animate-pulse" />
        </div>

        {/* QR preview skeleton */}
        <div className="mb-8 p-8 rounded-lg border-2 border-dashed border-neutral-700/50">
          <div className="h-64 w-64 mx-auto bg-neutral-700/50 rounded animate-pulse" />
        </div>

        {/* Controls skeleton */}
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
