import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="border-b">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Talent Marketplace
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/jobs" className="text-sm hover:underline">
            Browse Jobs
          </Link>
          <Link
            href="/company/login"
            className="text-sm px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800"
          >
            Company Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
