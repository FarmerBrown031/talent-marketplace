"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { safeParseJSON } from "@/lib/json";

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  skills: string;
  workHistory: string;
}

export default function ApplicantProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/talent")
      .then((r) => r.json())
      .then((json) => {
        const found = json.data?.find((a: Applicant) => a.id === params.id);
        if (found) setApplicant(found);
      });
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    form.forEach((value, key) => {
      if (typeof value === "string") data[key] = value;
    });

    const res = await fetch(`/api/talent/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(json.error || "Something went wrong");
      return;
    }

    router.refresh();
  }

  if (!applicant) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 bg-white">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-blue-100 rounded-md" />
          <div className="h-10 bg-blue-100 rounded-md" />
          <div className="h-10 bg-blue-100 rounded-md" />
          <div className="h-10 bg-blue-100 rounded-md" />
          <div className="h-10 bg-blue-100 rounded-md" />
          <div className="h-24 bg-blue-100 rounded-md" />
        </div>
      </div>
    );
  }

  const workHistory = safeParseJSON<
    { company: string; role: string; years: number }[]
  >(applicant.workHistory, []);

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 w-full bg-white">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">
        Applicant Profile
      </h1>
      {error && (
        <p className="text-red-700 text-sm mb-4 bg-red-50 border border-red-200 p-3 rounded-md">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-blue-900">
            Name
          </label>
          <input
            name="name"
            defaultValue={applicant.name}
            className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-blue-900">
            Email
          </label>
          <input
            name="email"
            defaultValue={applicant.email}
            className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-blue-900">
            Phone
          </label>
          <input
            name="phone"
            defaultValue={applicant.phone || ""}
            className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-blue-900">
            Skills
          </label>
          <input
            name="skills"
            defaultValue={applicant.skills}
            className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-blue-900">
            Work History
          </label>
          {workHistory.length === 0 ? (
            <p className="text-sm text-blue-700">No work history listed.</p>
          ) : (
            <div className="space-y-2">
              {workHistory.map((wh, i) => (
                <div
                  key={i}
                  className="text-sm border border-blue-200 rounded p-3 bg-blue-50"
                >
                  <p className="font-medium text-blue-900">{wh.role}</p>
                  <p className="text-blue-700">
                    {wh.company} &middot; {wh.years} year(s)
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
