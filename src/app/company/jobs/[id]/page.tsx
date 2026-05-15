"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CustomQuestion {
  label: string;
  type: "text" | "textarea" | "file";
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  status: string;
  customQuestions: string;
}

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((json) => {
        const found = json.data?.find((j: Job) => j.id === params.id);
        if (found) {
          setJob(found);
          setCustomQuestions(JSON.parse(found.customQuestions || "[]"));
        }
      });
  }, [params.id]);

  function addQuestion() {
    setCustomQuestions([...customQuestions, { label: "", type: "text" }]);
  }

  function removeQuestion(index: number) {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  }

  function updateQuestion(
    index: number,
    field: keyof CustomQuestion,
    value: string
  ) {
    const updated = [...customQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setCustomQuestions(updated);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    form.forEach((value, key) => {
      if (typeof value === "string") data[key] = value;
    });

    data.customQuestions = customQuestions.filter((q) => q.label.trim());

    const res = await fetch(`/api/jobs/${params.id}`, {
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

    router.push("/company/jobs");
    router.refresh();
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 w-full">
      <h1 className="text-2xl font-bold mb-6">Edit Job</h1>
      {error && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-md">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            name="title"
            defaultValue={job.title}
            required
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Description *
          </label>
          <textarea
            name="description"
            defaultValue={job.description}
            required
            rows={5}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location *</label>
          <input
            name="location"
            defaultValue={job.location}
            required
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type *</label>
          <select
            name="type"
            defaultValue={job.type}
            required
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="remote">Remote</option>
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            defaultValue={job.status}
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">
              Custom Application Questions
            </label>
            <button
              type="button"
              onClick={addQuestion}
              className="text-sm px-3 py-1 border rounded-md hover:bg-zinc-50"
            >
              + Add Question
            </button>
          </div>
          {customQuestions.map((q, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                value={q.label}
                onChange={(e) => updateQuestion(i, "label", e.target.value)}
                placeholder="Question text"
                className="flex-1 border rounded-md px-3 py-2 text-sm"
              />
              <select
                value={q.type}
                onChange={(e) => updateQuestion(i, "type", e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="file">File</option>
              </select>
              <button
                type="button"
                onClick={() => removeQuestion(i)}
                className="text-sm px-2 py-1 text-red-600 hover:bg-red-50 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-black text-white rounded-md hover:bg-zinc-800 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
