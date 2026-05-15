import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeParseJSON } from "@/lib/json";
import PublicHeader from "@/components/PublicHeader";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ applied?: string }>;
}) {
  const { id } = await params;
  const { applied } = await searchParams;

  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: { select: { name: true } } },
  });

  if (!job || job.status === "closed") {
    notFound();
  }

  const customQuestions = safeParseJSON<{ label: string; type: string }[]>(
    job.customQuestions,
    []
  );

  return (
    <div className="flex flex-col flex-1 bg-white">
      <PublicHeader />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        {applied === "true" && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-md">
            <p className="text-emerald-800 font-medium">
              Application submitted successfully!
            </p>
            <p className="text-emerald-700 text-sm mt-1">
              The company will review your application and reach out.
            </p>
          </div>
        )}
        <Link
          href="/jobs"
          className="text-sm text-blue-700 hover:underline mb-4 inline-block"
        >
          &larr; Back to jobs
        </Link>
        <h1 className="text-3xl font-bold mb-2 text-blue-900">{job.title}</h1>
        <p className="text-blue-700 mb-6">
          {job.company.name} &middot; {job.location} &middot;{" "}
          <span className="capitalize">{job.type}</span>
        </p>
        <div className="prose max-w-none mb-8 text-blue-950 whitespace-pre-wrap">
          <p>{job.description}</p>
        </div>
        {customQuestions.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold mb-2 text-blue-900">
              Additional Information Required
            </h3>
            <ul className="list-disc list-inside text-sm text-blue-800">
              {customQuestions.map((q, i) => (
                <li key={i}>{q.label}</li>
              ))}
            </ul>
          </div>
        )}
        {applied !== "true" && (
          <Link
            href={`/jobs/${job.id}/apply`}
            className="inline-block px-6 py-3 min-h-[44px] leading-10 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Now
          </Link>
        )}
      </main>
    </div>
  );
}
