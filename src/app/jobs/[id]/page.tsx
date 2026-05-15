import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: { select: { name: true } } },
  });

  if (!job || job.status === "closed") {
    notFound();
  }

  const customQuestions = JSON.parse(job.customQuestions || "[]") as {
    label: string;
    type: string;
  }[];

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
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <Link
          href="/jobs"
          className="text-sm text-zinc-500 hover:underline mb-4 inline-block"
        >
          &larr; Back to jobs
        </Link>
        <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
        <p className="text-zinc-500 mb-6">
          {job.company.name} &middot; {job.location} &middot; {job.type}
        </p>
        <div className="prose max-w-none mb-8">
          <p>{job.description}</p>
        </div>
        {customQuestions.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold mb-2">
              Additional Information Required
            </h3>
            <ul className="list-disc list-inside text-sm text-zinc-600">
              {customQuestions.map((q, i) => (
                <li key={i}>{q.label}</li>
              ))}
            </ul>
          </div>
        )}
        <Link
          href={`/jobs/${job.id}/apply`}
          className="inline-block px-6 py-3 bg-black text-white rounded-md hover:bg-zinc-800"
        >
          Apply Now
        </Link>
      </main>
    </div>
  );
}
