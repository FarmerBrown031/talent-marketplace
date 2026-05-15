import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="border-b border-blue-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-blue-900"
        >
          Talent Marketplace
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/jobs"
            className="text-sm text-blue-700 hover:text-blue-900 hover:underline"
          >
            Browse Jobs
          </Link>
          <Link
            href="/company/login"
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Company Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
