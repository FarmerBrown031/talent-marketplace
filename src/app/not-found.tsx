import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 bg-white">
      <h2 className="text-2xl font-bold text-blue-900">Page not found</h2>
      <p className="text-blue-700">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Go home
      </Link>
    </div>
  );
}
