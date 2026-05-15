"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    form.forEach((value, key) => {
      if (typeof value === "string") {
        data[key] = value;
      }
    });

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

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Apply for this position</h1>
      {error && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-md">
          {error}
        </p>
      )}
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
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-black text-white rounded-md hover:bg-zinc-800 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
