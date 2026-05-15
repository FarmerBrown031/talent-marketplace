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

  if (company.role === "admin") {
    redirect("/admin");
  }

  const [jobCount, openJobCount, applicantCount, hiredCount, teamCount] =
    await Promise.all([
      prisma.job.count({ where: { companyId: company.id } }),
      prisma.job.count({
        where: { companyId: company.id, status: "open" },
      }),
      prisma.application.count({
        where: { job: { companyId: company.id } },
      }),
      prisma.application.count({
        where: { job: { companyId: company.id }, status: "hired" },
      }),
      prisma.user.count({ where: { companyId: company.id } }),
    ]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 w-full bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">{company.name}</h1>
          <p className="text-sm text-blue-700">Company Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/company/jobs/new"
            className="px-4 py-2 min-h-[44px] leading-5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Post a Job
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        <Stat label="Active Jobs" value={openJobCount} />
        <Stat label="Total Jobs" value={jobCount} />
        <Stat label="Applicants" value={applicantCount} />
        <Stat label="Hired" value={hiredCount} highlight />
        <Stat label="Team" value={teamCount} />
      </div>

      {jobCount === 0 && (
        <div className="border border-blue-200 rounded-lg p-8 text-center mb-8 bg-blue-50">
          <h3 className="font-semibold text-lg mb-2 text-blue-900">
            Get started
          </h3>
          <p className="text-blue-700 text-sm mb-4">
            Post your first job opening — a Kanban board will be created for it
            automatically.
          </p>
          <Link
            href="/company/jobs/new"
            className="inline-block px-4 py-2 min-h-[44px] leading-5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Post a Job
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashCard
          href="/company/jobs"
          title="Manage Jobs"
          body="View, edit, and close job postings."
        />
        <DashCard
          href="/company/boards"
          title="Hiring Boards"
          body="Kanban view of every job's pipeline."
        />
        <DashCard
          href="/company/talent"
          title="Talent Pool"
          body="Browse every applicant who has applied to you."
        />
        <DashCard
          href="/company/team"
          title="Team"
          body="Invite teammates and set their permissions."
        />
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}): React.ReactElement {
  return (
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
}

function DashCard({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}): React.ReactElement {
  return (
    <Link
      href={href}
      className="border border-blue-200 rounded-lg p-5 bg-white hover:border-blue-500 transition-colors"
    >
      <h3 className="font-semibold text-blue-900">{title}</h3>
      <p className="text-sm text-blue-700 mt-1">{body}</p>
    </Link>
  );
}
