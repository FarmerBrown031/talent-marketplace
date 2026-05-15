import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage(): Promise<React.ReactElement> {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { name: true, email: true } },
      _count: { select: { applications: true } },
    },
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 w-full">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">All Jobs</h1>
          <p className="text-sm text-blue-700">
            {jobs.length} jobs across the platform
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
              <th className="text-left px-4 py-2 font-medium">Title</th>
              <th className="text-left px-4 py-2 font-medium">Company</th>
              <th className="text-left px-4 py-2 font-medium">Location</th>
              <th className="text-left px-4 py-2 font-medium">Type</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="text-left px-4 py-2 font-medium">Applicants</th>
              <th className="text-left px-4 py-2 font-medium">Posted</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-blue-700">
                  No jobs posted yet.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-t border-blue-100 text-blue-950"
                >
                  <td className="px-4 py-2 font-medium">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="hover:underline text-blue-700"
                    >
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{job.company.name}</td>
                  <td className="px-4 py-2">{job.location}</td>
                  <td className="px-4 py-2 capitalize">{job.type}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        job.status === "open"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{job._count.applications}</td>
                  <td className="px-4 py-2 text-blue-700">
                    {job.createdAt.toLocaleDateString()}
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
