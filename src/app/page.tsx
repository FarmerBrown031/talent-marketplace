import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Talent Marketplace</h1>
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
      <main className="flex-1 max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Find the talent you need.
        </h2>
        <p className="text-lg text-zinc-600 mb-8 max-w-lg mx-auto">
          Post jobs, review applicants, and manage your talent pool — all in
          one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/company/register"
            className="px-6 py-3 bg-black text-white rounded-md hover:bg-zinc-800"
          >
            Get Started
          </Link>
          <Link
            href="/jobs"
            className="px-6 py-3 border rounded-md hover:bg-zinc-50"
          >
            View Open Jobs
          </Link>
        </div>
      </main>
    </div>
  );
}
