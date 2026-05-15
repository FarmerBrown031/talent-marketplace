export default function JobsLoading() {
  return (
    <div className="flex flex-col flex-1">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="h-6 w-40 bg-zinc-100 rounded animate-pulse" />
          <div className="h-8 w-28 bg-zinc-100 rounded-md animate-pulse" />
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="h-8 w-48 bg-zinc-100 rounded animate-pulse mb-8" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border rounded-lg p-6 animate-pulse space-y-2"
            >
              <div className="h-5 w-3/4 bg-zinc-100 rounded" />
              <div className="h-4 w-1/2 bg-zinc-100 rounded" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
