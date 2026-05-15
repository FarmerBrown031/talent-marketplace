import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import type { ApiResponse, ApplicationStatus } from "@/lib/types";

const STAGES: readonly ApplicationStatus[] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
] as const;

const patchSchema = z.object({
  status: z.enum(STAGES).optional(),
  rating: z.number().int().min(0).max(5).optional(),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const company = await getCurrentCompany();
    if (!company) {
      return NextResponse.json(
        { error: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      );
    }

    const { id } = await ctx.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: { select: { companyId: true } } },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    if (
      application.job.companyId !== company.id &&
      company.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Forbidden" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const updated = await prisma.application.update({
      where: { id },
      data: parsed.data,
    });

    await recordAudit({
      actorId: company.id,
      actorType: company.role === "admin" ? "admin" : "company",
      action: "application.update",
      targetType: "Application",
      targetId: id,
      companyId: application.job.companyId,
      metadata: {
        from: application.status,
        to: updated.status,
        changed: Object.keys(parsed.data),
      },
    });

    return NextResponse.json(
      { data: { id: updated.id, status: updated.status } } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (err) {
    logger.error("application update failed", err);
    return NextResponse.json(
      { error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
