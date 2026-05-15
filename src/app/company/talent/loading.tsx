export default function TalentPoolLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 w-full">
      <div className="h-8 w-40 bg-zinc-100 rounded animate-pulse mb-8" />
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border rounded-lg p-6 animate-pulse space-y-2"
          >
            <div className="h-5 w-1/2 bg-zinc-100 rounded" />
            <div className="h-4 w-2/3 bg-zinc-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
