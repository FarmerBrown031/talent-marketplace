import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const company = await getCurrentCompany();

  if (!company) {
    redirect("/company/login");
  }

  const jobCount = await prisma.job.count({
    where: { companyId: company.id },
  });

  const applicantCount = await prisma.application.count({
    where: { job: { companyId: company.id } },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-sm text-zinc-500">Company Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/company/jobs/new"
            className="px-4 py-2 min-h-[44px] leading-5 bg-black text-white rounded-md text-sm hover:bg-zinc-800"
          >
            Post a Job
          </Link>
          <Link
            href="/api/auth/logout"
            className="text-sm text-zinc-500 hover:underline"
          >
            Logout
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="border rounded-lg p-6">
          <p className="text-3xl font-bold">{jobCount}</p>
          <p className="text-sm text-zinc-500">Active Jobs</p>
        </div>
        <div className="border rounded-lg p-6">
          <p className="text-3xl font-bold">{applicantCount}</p>
          <p className="text-sm text-zinc-500">Total Applicants</p>
        </div>
      </div>

      {jobCount === 0 && (
        <div className="border rounded-lg p-8 text-center mb-8 bg-zinc-50">
          <h3 className="font-semibold text-lg mb-2">Get started</h3>
          <p className="text-zinc-500 text-sm mb-4">
            Post your first job opening to start receiving applications.
          </p>
          <Link
            href="/company/jobs/new"
            className="inline-block px-4 py-2 min-h-[44px] leading-5 bg-black text-white rounded-md text-sm hover:bg-zinc-800"
          >
            Post a Job
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/company/jobs"
          className="border rounded-lg p-6 hover:border-zinc-400 transition-colors"
        >
          <h3 className="font-semibold">Manage Jobs</h3>
          <p className="text-sm text-zinc-500 mt-1">
            View, edit, and close job postings
          </p>
        </Link>
        <Link
          href="/company/talent"
          className="border rounded-lg p-6 hover:border-zinc-400 transition-colors"
        >
          <h3 className="font-semibold">Talent Pool</h3>
          <p className="text-sm text-zinc-500 mt-1">
            Browse and manage all applicants
          </p>
        </Link>
      </div>
    </div>
  );
}
