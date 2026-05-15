export default function CompanyJobsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 w-full">
      <div className="h-8 w-32 bg-blue-100 rounded animate-pulse mb-8" />
      <div className="grid gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="border rounded-lg p-6 animate-pulse space-y-2"
          >
            <div className="h-5 w-3/4 bg-blue-100 rounded" />
            <div className="h-4 w-1/2 bg-blue-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
