"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-zinc-600">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800"
      >
        Try again
      </button>
    </div>
  );
}
