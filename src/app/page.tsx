import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-white">
      <PublicHeader />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-4 text-blue-900">
          Find the talent you need.
        </h2>
        <p className="text-lg text-blue-800 mb-8 max-w-lg mx-auto">
          Post jobs, manage hiring pipelines with Kanban boards, and grow your
          talent pool — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/company/register"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Get Started
          </Link>
          <Link
            href="/jobs"
            className="px-6 py-3 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50"
          >
            View Open Jobs
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-16 text-left">
          <Feature
            title="Kanban hiring boards"
            body="Drag candidates through stages — Applied, Screening, Interview, Offer, Hired."
          />
          <Feature
            title="Team workspaces"
            body="Invite owners, members, and viewers to collaborate on the talent pipeline."
          />
          <Feature
            title="Audit trail"
            body="Every stage move and team change is recorded for admins to review."
          />
        </div>
      </main>
    </div>
  );
}

function Feature({
  title,
  body,
}: {
  title: string;
  body: string;
}): React.ReactElement {
  return (
    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
      <h3 className="font-semibold text-blue-900 mb-1">{title}</h3>
      <p className="text-sm text-blue-800">{body}</p>
    </div>
  );
}
