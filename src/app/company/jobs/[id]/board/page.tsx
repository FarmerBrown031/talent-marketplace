import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/auth";
import KanbanBoard from "@/components/KanbanBoard";
import type { KanbanCard } from "@/components/KanbanBoard";
import type { ApplicationStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function JobBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
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
      <main className="max-w-6xl mx-auto px-4 py-12 w-full bg-white">
        <p className="text-blue-700">Job not found.</p>
      </main>
    );
  }

  const cards: KanbanCard[] = job.applications.map((a) => ({
    id: a.id,
    applicantId: a.applicant.id,
    applicantName: a.applicant.name,
    applicantEmail: a.applicant.email,
    skills: a.applicant.skills,
    status: a.status as ApplicationStatus,
    rating: a.rating,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 w-full bg-white">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <Link
            href="/company/jobs"
            className="text-sm text-blue-700 hover:underline"
          >
            ← Back to jobs
          </Link>
          <h1 className="text-2xl font-bold text-blue-900 mt-1">
            {job.title} · Hiring Pipeline
          </h1>
          <p className="text-sm text-blue-700">
            {job.applications.length} applicant
            {job.applications.length === 1 ? "" : "s"} · {job.location} ·{" "}
            <span className="capitalize">{job.type}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/company/jobs/${job.id}/applicants`}
            className="text-sm px-3 py-1.5 border border-blue-200 rounded-md text-blue-700 hover:bg-blue-50"
          >
            List view
          </Link>
          <Link
            href={`/company/jobs/${job.id}`}
            className="text-sm px-3 py-1.5 border border-blue-200 rounded-md text-blue-700 hover:bg-blue-50"
          >
            Edit job
          </Link>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="border border-blue-200 rounded-lg p-8 text-center bg-blue-50">
          <h3 className="font-semibold text-lg mb-2 text-blue-900">
            No applicants yet
          </h3>
          <p className="text-sm text-blue-700">
            Share your public job link to start collecting applications. They
            will appear here as draggable cards.
          </p>
        </div>
      ) : (
        <KanbanBoard cards={cards} />
      )}
    </main>
  );
}
