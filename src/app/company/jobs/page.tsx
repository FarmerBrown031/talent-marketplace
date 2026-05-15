import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CompanyJobsPage() {
  const company = await getCurrentCompany();
  if (!company) redirect("/company/login");

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 w-full bg-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-blue-900">My Jobs</h1>
        <Link
          href="/company/jobs/new"
          className="px-4 py-2 min-h-[44px] leading-5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="border border-blue-200 rounded-lg p-8 text-center bg-blue-50">
          <h3 className="font-semibold text-lg mb-2 text-blue-900">
            No jobs posted yet
          </h3>
          <p className="text-blue-700 text-sm mb-4">
            Create your first job posting to start attracting candidates.
          </p>
          <Link
            href="/company/jobs/new"
            className="inline-block px-4 py-2 min-h-[44px] leading-5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Post a Job
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="border border-blue-200 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate text-blue-900">
                    {job.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      job.status === "open"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  {job.location} &middot; {job.type} &middot;{" "}
                  {job._count.applications} applicant(s)
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <Link
                  href={`/company/jobs/${job.id}/board`}
                  className="text-sm px-3 py-1.5 min-h-[44px] leading-7 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Board
                </Link>
                <Link
                  href={`/company/jobs/${job.id}/applicants`}
                  className="text-sm px-3 py-1.5 min-h-[44px] leading-7 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50"
                >
                  Applicants
                </Link>
                <Link
                  href={`/company/jobs/${job.id}`}
                  className="text-sm px-3 py-1.5 min-h-[44px] leading-7 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
