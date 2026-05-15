"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { safeParseJSON } from "@/lib/json";

interface CustomQuestion {
  label: string;
  type: "text" | "textarea" | "file";
}

interface CustomAnswer {
  questionLabel: string;
  answer: string;
}

interface Job {
  id: string;
  title: string;
  customQuestions: string;
}

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [customAnswers, setCustomAnswers] = useState<CustomAnswer[]>([]);

  useEffect(() => {
    fetch("/api/jobs/" + params.id)
      .then((r) => r.json())
      .then((json) => {
        const found = json.data as Job;
        if (found) {
          setJob(found);
          const questions = safeParseJSON<CustomQuestion[]>(
            found.customQuestions,
            []
          );
          setCustomAnswers(
            questions.map((q) => ({ questionLabel: q.label, answer: "" }))
          );
        }
      });
  }, [params.id]);

  function updateAnswer(label: string, value: string) {
    setCustomAnswers(
      customAnswers.map((a) =>
        a.questionLabel === label ? { ...a, answer: value } : a
      )
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    form.forEach((value, key) => {
      if (typeof value === "string") {
        data[key] = value;
      }
    });

    data.customAnswers = customAnswers;

    const res = await fetch("/api/jobs/" + params.id + "/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(json.error || "Something went wrong");
      return;
    }

    router.push("/jobs/" + params.id + "?applied=true");
  }

  const questions: CustomQuestion[] = job
    ? safeParseJSON<CustomQuestion[]>(job.customQuestions, [])
    : [];

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">
        {job ? `Apply for ${job.title}` : "Apply for this position"}
      </h1>
      {error && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-md">
          {error}
        </p>
      )}
      {!job ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-zinc-100 rounded-md" />
          <div className="h-10 bg-zinc-100 rounded-md" />
          <div className="h-10 bg-zinc-100 rounded-md" />
          <div className="h-10 bg-zinc-100 rounded-md" />
          {[1, 2].map((i) => (
            <div key={i} className="h-10 bg-zinc-100 rounded-md" />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              name="name"
              required
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              name="email"
              type="email"
              required
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              name="phone"
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Skills *</label>
            <input
              name="skills"
              required
              placeholder="e.g. React, Python, Design"
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          {questions.map((q, i) => (
            <div key={i}>
              <label className="block text-sm font-medium mb-1">
                {q.label}
                {q.type !== "file" ? " *" : ""}
              </label>
              {q.type === "textarea" ? (
                <textarea
                  required
                  rows={3}
                  value={customAnswers[i]?.answer || ""}
                  onChange={(e) => updateAnswer(q.label, e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              ) : q.type === "file" ? (
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    updateAnswer(q.label, file ? file.name : "");
                  }}
                  className="w-full text-sm"
                />
              ) : (
                <input
                  required
                  value={customAnswers[i]?.answer || ""}
                  onChange={(e) => updateAnswer(q.label, e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-black text-white rounded-md hover:bg-zinc-800 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      )}
    </div>
  );
}
