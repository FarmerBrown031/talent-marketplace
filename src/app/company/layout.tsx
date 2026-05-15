import Link from "next/link";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/company/dashboard" className="text-lg font-bold">
            Talent Marketplace
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/company/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/company/jobs" className="hover:underline">
              Jobs
            </Link>
            <Link href="/company/talent" className="hover:underline">
              Talent
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-zinc-500 hover:underline"
              >
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
