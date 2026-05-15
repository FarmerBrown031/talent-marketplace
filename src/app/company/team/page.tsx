import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/auth";
import TeamManager from "@/components/TeamManager";
import type { TeamMember } from "@/components/TeamManager";
import type { UserRole, UserStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TeamPage(): Promise<React.ReactElement> {
  const company = await getCurrentCompany();
  if (!company) redirect("/company/login");

  const users = await prisma.user.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "asc" },
  });

  const members: TeamMember[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as UserRole,
    status: u.status as UserStatus,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 w-full bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">Team</h1>
        <p className="text-sm text-blue-700">
          Manage who can access the {company.name} workspace.
        </p>
      </div>
      <TeamManager members={members} />
    </main>
  );
}
