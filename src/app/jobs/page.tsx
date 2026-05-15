import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    where: { status: "open" },
    include: { company: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col flex-1">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Talent Marketplace
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/company/login"
              className="text-sm px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800"
            >
              Company Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
        <h2 className="text-2xl font-bold mb-8">Open Positions</h2>
        {jobs.length === 0 ? (
          <p className="text-zinc-500">No open positions right now.</p>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block border rounded-lg p-6 hover:border-zinc-400 transition-colors"
              >
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {job.company.name} &middot; {job.location} &middot;{" "}
                  {job.type}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
