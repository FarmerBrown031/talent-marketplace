"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  skills: string;
  workHistory: string;
}

function parseJSON<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
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
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-zinc-100 rounded-md" />
          <div className="h-10 bg-zinc-100 rounded-md" />
          <div className="h-10 bg-zinc-100 rounded-md" />
          <div className="h-10 bg-zinc-100 rounded-md" />
          <div className="h-10 bg-zinc-100 rounded-md" />
          <div className="h-24 bg-zinc-100 rounded-md" />
        </div>
      </div>
    );
  }

  const workHistory = parseJSON<{ company: string; role: string; years: number }[]>(
    applicant.workHistory,
    []
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 w-full">
      <h1 className="text-2xl font-bold mb-6">Applicant Profile</h1>
      {error && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-md">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            defaultValue={applicant.name}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            defaultValue={applicant.email}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            name="phone"
            defaultValue={applicant.phone || ""}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Skills</label>
          <input
            name="skills"
            defaultValue={applicant.skills}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Work History
          </label>
          {workHistory.length === 0 ? (
            <p className="text-sm text-zinc-400">No work history listed.</p>
          ) : (
            <div className="space-y-2">
              {workHistory.map((wh, i) => (
                <div key={i} className="text-sm border rounded p-3">
                  <p className="font-medium">{wh.role}</p>
                  <p className="text-zinc-500">
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
            className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-zinc-800 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
