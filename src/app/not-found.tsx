import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8">
      <h2 className="text-2xl font-bold">Page not found</h2>
      <p className="text-zinc-600">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800"
      >
        Go home
      </Link>
    </div>
  );
}
