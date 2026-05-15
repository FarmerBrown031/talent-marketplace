import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TalentPoolPage() {
  const company = await getCurrentCompany();
  if (!company) redirect("/company/login");

  const applicants = await prisma.applicant.findMany({
    where: {
      applications: {
        some: { job: { companyId: company.id } },
      },
    },
    include: {
      applications: {
        where: { job: { companyId: company.id } },
        include: { job: { select: { title: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 w-full">
      <h1 className="text-2xl font-bold mb-8">Talent Pool</h1>

      {applicants.length === 0 ? (
        <p className="text-zinc-500">
          No applicants yet. Applications will appear here once candidates apply
          to your jobs.
        </p>
      ) : (
        <div className="grid gap-4">
          {applicants.map((applicant) => (
            <Link
              key={applicant.id}
              href={`/company/talent/${applicant.id}`}
              className="border rounded-lg p-6 hover:border-zinc-400 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{applicant.name}</h3>
                  <p className="text-sm text-zinc-500">
                    {applicant.email} &middot; {applicant.skills}
                  </p>
                </div>
                <div className="text-right text-sm text-zinc-500">
                  {applicant.applications.length} application(s)
                </div>
              </div>
              {applicant.applications.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {applicant.applications.map((app) => (
                    <span
                      key={app.id}
                      className="text-xs bg-zinc-100 px-2 py-0.5 rounded"
                    >
                      {app.job.title}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
