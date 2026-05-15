import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage(): Promise<React.ReactElement> {
  const [
    companyCount,
    jobCount,
    openJobCount,
    applicantCount,
    applicationCount,
    hiredCount,
    recentApplications,
    statusCounts,
  ] = await Promise.all([
    prisma.company.count({ where: { role: { not: "admin" } } }),
    prisma.job.count(),
    prisma.job.count({ where: { status: "open" } }),
    prisma.applicant.count(),
    prisma.application.count(),
    prisma.application.count({ where: { status: "hired" } }),
    prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        applicant: { select: { name: true, email: true } },
        job: { select: { title: true, company: { select: { name: true } } } },
      },
    }),
    prisma.application.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const statusMap = new Map(statusCounts.map((s) => [s.status, s._count._all]));

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-900">Platform Overview</h1>
        <p className="text-sm text-blue-700">
          Real-time view of every company, job, and applicant.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        <Stat label="Companies" value={companyCount} href="/admin/companies" />
        <Stat label="Total Jobs" value={jobCount} href="/admin/jobs" />
        <Stat label="Open Jobs" value={openJobCount} />
        <Stat label="Applicants" value={applicantCount} href="/admin/applicants" />
        <Stat label="Applications" value={applicationCount} />
        <Stat label="Hired" value={hiredCount} highlight />
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">
          Pipeline breakdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(
            [
              "applied",
              "screening",
              "interview",
              "offer",
              "hired",
              "rejected",
            ] as const
          ).map((s) => (
            <div
              key={s}
              className="border border-blue-200 rounded-lg p-4 bg-white"
            >
              <p className="text-2xl font-bold text-blue-900">
                {statusMap.get(s) ?? 0}
              </p>
              <p className="text-xs text-blue-700 capitalize">{s}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-blue-900 mb-3">
          Recent applications
        </h2>
        <div className="border border-blue-200 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 text-blue-900">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Applicant</th>
                <th className="text-left px-4 py-2 font-medium">Job</th>
                <th className="text-left px-4 py-2 font-medium">Company</th>
                <th className="text-left px-4 py-2 font-medium">Stage</th>
                <th className="text-left px-4 py-2 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-blue-700">
                    No applications yet.
                  </td>
                </tr>
              ) : (
                recentApplications.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t border-blue-100 text-blue-950"
                  >
                    <td className="px-4 py-2">
                      <p className="font-medium">{a.applicant.name}</p>
                      <p className="text-xs text-blue-700">
                        {a.applicant.email}
                      </p>
                    </td>
                    <td className="px-4 py-2">{a.job.title}</td>
                    <td className="px-4 py-2">{a.job.company.name}</td>
                    <td className="px-4 py-2 capitalize">{a.status}</td>
                    <td className="px-4 py-2 text-blue-700">
                      {a.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: number;
  href?: string;
  highlight?: boolean;
}): React.ReactElement {
  const body = (
    <div
      className={`border rounded-lg p-4 ${
        highlight
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-blue-200 bg-white text-blue-900"
      }`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className={`text-xs ${highlight ? "text-blue-100" : "text-blue-700"}`}>
        {label}
      </p>
    </div>
  );
  return href ? (
    <Link href={href} className="block hover:opacity-90 transition-opacity">
      {body}
    </Link>
  ) : (
    body
  );
}
