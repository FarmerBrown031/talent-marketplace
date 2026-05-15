import Link from "next/link";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 bg-white">
      <header className="border-b border-blue-200 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
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
            <Link href="/company/boards" className="hover:underline">
              Boards
            </Link>
            <Link href="/company/talent" className="hover:underline">
              Talent
            </Link>
            <Link href="/company/team" className="hover:underline">
              Team
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-blue-100 hover:text-white hover:underline"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
