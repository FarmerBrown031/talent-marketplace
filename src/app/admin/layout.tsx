import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const company = await getCurrentCompany();
  if (!company) redirect("/company/login");
  if (company.role !== "admin") redirect("/company/dashboard");

  return (
    <div className="flex flex-col flex-1 bg-white">
      <header className="border-b border-blue-200 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="text-lg font-bold">
            Talent Marketplace · Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="hover:underline">
              Overview
            </Link>
            <Link href="/admin/companies" className="hover:underline">
              Companies
            </Link>
            <Link href="/admin/jobs" className="hover:underline">
              Jobs
            </Link>
            <Link href="/admin/applicants" className="hover:underline">
              Applicants
            </Link>
            <Link href="/admin/audit" className="hover:underline">
              Audit Log
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
