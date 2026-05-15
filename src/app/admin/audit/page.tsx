import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage(): Promise<React.ReactElement> {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { company: { select: { name: true, email: true } } },
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 w-full">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Audit Log</h1>
          <p className="text-sm text-blue-700">
            Most recent {logs.length} platform events
          </p>
        </div>
        <Link href="/admin" className="text-sm text-blue-700 hover:underline">
          ← Overview
        </Link>
      </div>

      <div className="border border-blue-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-blue-50 text-blue-900">
            <tr>
              <th className="text-left px-4 py-2 font-medium">When</th>
              <th className="text-left px-4 py-2 font-medium">Actor</th>
              <th className="text-left px-4 py-2 font-medium">Action</th>
              <th className="text-left px-4 py-2 font-medium">Target</th>
              <th className="text-left px-4 py-2 font-medium">Company</th>
              <th className="text-left px-4 py-2 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-blue-700">
                  No events recorded yet. Activity will start showing as users
                  log in and act.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-t border-blue-100 text-blue-950"
                >
                  <td className="px-4 py-2 text-blue-700 whitespace-nowrap">
                    {log.createdAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 capitalize">{log.actorType}</td>
                  <td className="px-4 py-2 font-medium">{log.action}</td>
                  <td className="px-4 py-2">
                    {log.targetType}
                    {log.targetId ? (
                      <span className="text-blue-700">
                        :{log.targetId.slice(0, 6)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2">{log.company?.name ?? "—"}</td>
                  <td className="px-4 py-2 text-blue-700 font-mono text-xs truncate max-w-xs">
                    {log.metadata}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
