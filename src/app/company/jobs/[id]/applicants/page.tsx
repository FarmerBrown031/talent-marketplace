import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

  if (!job || job.companyId !== company.id) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <p className="text-zinc-500">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 w-full">
      <Link
        href="/company/jobs"
        className="text-sm text-zinc-500 hover:underline mb-4 inline-block"
      >
        &larr; Back to jobs
      </Link>
      <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
      <p className="text-sm text-zinc-500 mb-8">
        {job.applications.length} applicant(s)
      </p>

      {job.applications.length === 0 ? (
        <p className="text-zinc-500">No applications yet.</p>
      ) : (
        <div className="grid gap-4">
          {job.applications.map((app) => (
            <Link
              key={app.id}
              href={`/company/talent/${app.applicant.id}`}
              className="border rounded-lg p-6 flex items-center justify-between hover:border-zinc-400 transition-colors"
            >
              <div>
                <h3 className="font-semibold">{app.applicant.name}</h3>
                <p className="text-sm text-zinc-500">
                  {app.applicant.email} &middot; {app.applicant.skills}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  app.status === "new"
                    ? "bg-blue-100 text-blue-700"
                    : app.status === "reviewed"
                    ? "bg-yellow-100 text-yellow-700"
                    : app.status === "hired"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {app.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
