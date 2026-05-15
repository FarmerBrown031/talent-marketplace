import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/auth";
import { APPLICATION_STAGES } from "@/lib/types";
import type { ApplicationStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STAGE_LOOKUP = new Map(APPLICATION_STAGES.map((s) => [s.id, s.label]));

export default async function JobApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const company = await getCurrentCompany();
  if (!company) redirect("/company/login");

  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      applications: {
        include: { applicant: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!job || (job.companyId !== company.id && company.role !== "admin")) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12 bg-white">
        <p className="text-blue-700">Job not found.</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 w-full bg-white">
      <Link
        href="/company/jobs"
        className="text-sm text-blue-700 hover:underline mb-4 inline-block"
      >
        ← Back to jobs
      </Link>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <h1 className="text-2xl font-bold text-blue-900">{job.title}</h1>
        <Link
          href={`/company/jobs/${job.id}/board`}
          className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Open Kanban Board
        </Link>
      </div>
      <p className="text-sm text-blue-700 mb-8">
        {job.applications.length} applicant
        {job.applications.length === 1 ? "" : "s"}
      </p>

      {job.applications.length === 0 ? (
        <p className="text-blue-700">No applications yet.</p>
      ) : (
        <div className="grid gap-3">
          {job.applications.map((app) => {
            const status = app.status as ApplicationStatus;
            return (
              <Link
                key={app.id}
                href={`/company/talent/${app.applicant.id}`}
                className="border border-blue-200 rounded-lg p-5 flex items-center justify-between hover:border-blue-500 transition-colors bg-white"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold text-blue-900 truncate">
                    {app.applicant.name}
                  </h3>
                  <p className="text-sm text-blue-700 truncate">
                    {app.applicant.email} &middot; {app.applicant.skills}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 capitalize whitespace-nowrap">
                  {STAGE_LOOKUP.get(status) ?? status}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
