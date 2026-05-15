"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { UserRole, UserStatus } from "@/lib/types";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

interface TeamManagerProps {
  members: TeamMember[];
}

export default function TeamManager({
  members: initialMembers,
}: TeamManagerProps): React.ReactElement {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("member");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleInvite(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json?.error || "Failed to invite");
      return;
    }
    setName("");
    setEmail("");
    setRole("member");
    router.refresh();
  }

  function updateMember(id: string, patch: Partial<TeamMember>): void {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
    startTransition(async () => {
      const res = await fetch(`/api/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        router.refresh();
      }
    });
  }

  function removeMember(id: string): void {
    if (!confirm("Remove this team member?")) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    startTransition(async () => {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
      if (!res.ok) router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form
        onSubmit={handleInvite}
        className="lg:col-span-1 border border-blue-200 rounded-lg p-4 bg-white"
      >
        <h2 className="text-lg font-semibold text-blue-900 mb-3">
          Invite a teammate
        </h2>
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="owner">Owner — full access</option>
              <option value="member">Member — manage jobs</option>
              <option value="viewer">Viewer — read-only</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Send invite
          </button>
        </div>
      </form>

      <div className="lg:col-span-2 border border-blue-200 rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blue-50 text-blue-900">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Name</th>
              <th className="text-left px-4 py-2 font-medium">Email</th>
              <th className="text-left px-4 py-2 font-medium">Role</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="text-left px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-blue-700">
                  No teammates yet. Invite your first one to collaborate.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr
                  key={m.id}
                  className="border-t border-blue-100 text-blue-950"
                >
                  <td className="px-4 py-2 font-medium">{m.name}</td>
                  <td className="px-4 py-2">{m.email}</td>
                  <td className="px-4 py-2">
                    <select
                      value={m.role}
                      onChange={(e) =>
                        updateMember(m.id, {
                          role: e.target.value as UserRole,
                        })
                      }
                      className="text-xs border border-blue-200 rounded px-1.5 py-1 bg-white"
                    >
                      <option value="owner">Owner</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={m.status}
                      onChange={(e) =>
                        updateMember(m.id, {
                          status: e.target.value as UserStatus,
                        })
                      }
                      className="text-xs border border-blue-200 rounded px-1.5 py-1 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="invited">Invited</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeMember(m.id)}
                      className="text-xs text-red-700 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
