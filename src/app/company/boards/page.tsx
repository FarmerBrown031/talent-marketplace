import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/auth";
import { APPLICATION_STAGES } from "@/lib/types";
import type { ApplicationStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BoardsIndexPage(): Promise<React.ReactElement> {
  const company = await getCurrentCompany();
  if (!company) redirect("/company/login");

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    include: {
      applications: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 w-full bg-white">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Hiring Boards</h1>
          <p className="text-sm text-blue-700">
            One Kanban board per job. Open any board to drag candidates through
            your pipeline.
          </p>
        </div>
        <Link
          href="/company/jobs/new"
          className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Job + Board
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="border border-blue-200 rounded-lg p-8 text-center bg-blue-50">
          <h3 className="font-semibold text-lg mb-2 text-blue-900">
            No boards yet
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            Create a job posting to spin up your first hiring board.
          </p>
          <Link
            href="/company/jobs/new"
            className="inline-block text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Post a Job
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => {
            const counts = new Map<ApplicationStatus, number>();
            for (const a of job.applications) {
              const key = a.status as ApplicationStatus;
              counts.set(key, (counts.get(key) ?? 0) + 1);
            }
            return (
              <Link
                key={job.id}
                href={`/company/jobs/${job.id}/board`}
                className="block border border-blue-200 rounded-lg p-4 bg-white hover:border-blue-500"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-blue-900 truncate">
                      {job.title}
                    </h3>
                    <p className="text-xs text-blue-700 truncate">
                      {job.location} · {job.type}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                      job.status === "open"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  {APPLICATION_STAGES.slice(0, 6).map((s) => (
                    <div
                      key={s.id}
                      className={`rounded ${s.color} px-1 py-1 border`}
                    >
                      <p className="text-sm font-semibold text-blue-900">
                        {counts.get(s.id) ?? 0}
                      </p>
                      <p className="text-[10px] text-blue-700">{s.label}</p>
                    </div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
