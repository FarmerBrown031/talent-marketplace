"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CustomQuestion {
  label: string;
  type: "text" | "textarea" | "file";
}

export default function NewJobPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

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
      if (typeof value === "string") {
        data[key] = value;
      }
    });

    data.customQuestions = customQuestions.filter((q) => q.label.trim());

    const res = await fetch("/api/jobs", {
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

    router.push("/company/jobs");
    router.refresh();
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 w-full bg-white">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">Post a New Job</h1>
      {error && (
        <p className="text-red-700 text-sm mb-4 bg-red-50 border border-red-200 p-3 rounded-md">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-blue-900">
            Title *
          </label>
          <input
            name="title"
            required
            className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-blue-900">
            Description *
          </label>
          <textarea
            name="description"
            required
            rows={5}
            className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-blue-900">
            Location *
          </label>
          <input
            name="location"
            required
            className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-blue-900">
            Type *
          </label>
          <select
            name="type"
            required
            className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="remote">Remote</option>
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-blue-900">
              Custom Application Questions
            </label>
            <button
              type="button"
              onClick={addQuestion}
              className="text-sm px-3 py-1 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50"
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
                className="flex-1 border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={q.type}
                onChange={(e) => updateQuestion(i, "type", e.target.value)}
                className="border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="file">File</option>
              </select>
              <button
                type="button"
                onClick={() => removeQuestion(i)}
                className="text-sm px-2 py-1 text-red-700 hover:bg-red-50 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post Job"}
        </button>
      </form>
    </main>
  );
}
