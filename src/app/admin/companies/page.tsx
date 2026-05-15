import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage(): Promise<React.ReactElement> {
  const companies = await prisma.company.findMany({
    where: { role: { not: "admin" } },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { jobs: true, users: true } },
      jobs: {
        select: { id: true, _count: { select: { applications: true } } },
      },
    },
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 w-full">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Companies</h1>
          <p className="text-sm text-blue-700">
            {companies.length} registered companies
          </p>
        </div>
        <Link href="/admin" className="text-sm text-blue-700 hover:underline">
          ← Overview
        </Link>
      </div>

      <div className="border border-blue-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-blue-50 text-blue-900">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Name</th>
              <th className="text-left px-4 py-2 font-medium">Email</th>
              <th className="text-left px-4 py-2 font-medium">Jobs</th>
              <th className="text-left px-4 py-2 font-medium">Applicants</th>
              <th className="text-left px-4 py-2 font-medium">Team</th>
              <th className="text-left px-4 py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-blue-700">
                  No companies yet.
                </td>
              </tr>
            ) : (
              companies.map((c) => {
                const applicantTotal = c.jobs.reduce(
                  (sum, j) => sum + j._count.applications,
                  0
                );
                return (
                  <tr
                    key={c.id}
                    className="border-t border-blue-100 text-blue-950"
                  >
                    <td className="px-4 py-2 font-medium">{c.name}</td>
                    <td className="px-4 py-2">{c.email}</td>
                    <td className="px-4 py-2">{c._count.jobs}</td>
                    <td className="px-4 py-2">{applicantTotal}</td>
                    <td className="px-4 py-2">{c._count.users}</td>
                    <td className="px-4 py-2 text-blue-700">
                      {c.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
