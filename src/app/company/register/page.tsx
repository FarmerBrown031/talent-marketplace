"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(json.error || "Registration failed");
      return;
    }

    router.push("/company/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Company Registration
        </h1>
        {error && (
          <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-md">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Company Name
            </label>
            <input
              name="name"
              required
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800 disabled:opacity-50"
          >
            {submitting ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="text-sm text-zinc-500 text-center mt-4">
          Already have an account?{" "}
          <Link href="/company/login" className="underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
