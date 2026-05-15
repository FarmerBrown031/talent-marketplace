import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface AuditEntry {
  actorId?: string | null;
  actorType: "company" | "admin" | "applicant" | "system";
  action: string;
  targetType: string;
  targetId?: string | null;
  companyId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        actorType: entry.actorType,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId ?? null,
        companyId: entry.companyId ?? null,
        metadata: JSON.stringify(entry.metadata ?? {}),
      },
    });
  } catch (err) {
    logger.error("audit log failed", err);
  }
}
