import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PublicHeader from "@/components/PublicHeader";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    where: { status: "open" },
    include: { company: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col flex-1 bg-white">
      <PublicHeader />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
        <h2 className="text-2xl font-bold mb-8 text-blue-900">
          Open Positions
        </h2>
        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-blue-800 text-lg mb-2">
              No open positions right now.
            </p>
            <p className="text-blue-600 text-sm">
              Check back later or{" "}
              <Link
                href="/company/register"
                className="underline text-blue-700 font-medium"
              >
                register your company
              </Link>{" "}
              to post a job.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block border border-blue-200 rounded-lg p-6 hover:border-blue-500 transition-colors bg-white"
              >
                <h3 className="text-lg font-semibold text-blue-900">
                  {job.title}
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  {job.company.name} &middot; {job.location} &middot;{" "}
                  <span className="capitalize">{job.type}</span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
