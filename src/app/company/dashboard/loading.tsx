export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-zinc-100 rounded animate-pulse" />
          <div className="h-4 w-28 bg-zinc-100 rounded animate-pulse" />
        </div>
        <div className="h-9 w-28 bg-zinc-100 rounded-md animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border rounded-lg p-6 animate-pulse space-y-2">
          <div className="h-8 w-12 bg-zinc-100 rounded" />
          <div className="h-4 w-20 bg-zinc-100 rounded" />
        </div>
        <div className="border rounded-lg p-6 animate-pulse space-y-2">
          <div className="h-8 w-12 bg-zinc-100 rounded" />
          <div className="h-4 w-20 bg-zinc-100 rounded" />
        </div>
      </div>
    </div>
  );
}
