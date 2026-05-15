import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminApplicantsPage(): Promise<React.ReactElement> {
  const applicants = await prisma.applicant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { applications: true } },
      applications: {
        select: {
          status: true,
          job: { select: { title: true, company: { select: { name: true } } } },
        },
      },
    },
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 w-full">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">All Applicants</h1>
          <p className="text-sm text-blue-700">
            {applicants.length} unique applicants in the platform
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
              <th className="text-left px-4 py-2 font-medium">Skills</th>
              <th className="text-left px-4 py-2 font-medium">Applications</th>
              <th className="text-left px-4 py-2 font-medium">Latest stage</th>
            </tr>
          </thead>
          <tbody>
            {applicants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-blue-700">
                  No applicants yet.
                </td>
              </tr>
            ) : (
              applicants.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-blue-100 text-blue-950"
                >
                  <td className="px-4 py-2 font-medium">{a.name}</td>
                  <td className="px-4 py-2">{a.email}</td>
                  <td className="px-4 py-2 text-blue-700 truncate max-w-xs">
                    {a.skills}
                  </td>
                  <td className="px-4 py-2">{a._count.applications}</td>
                  <td className="px-4 py-2 capitalize">
                    {a.applications[0]?.status ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
