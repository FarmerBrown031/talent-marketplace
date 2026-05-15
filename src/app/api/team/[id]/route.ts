import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/lib/types";

const patchSchema = z.object({
  role: z.enum(["owner", "member", "viewer"]).optional(),
  status: z.enum(["active", "invited", "disabled"]).optional(),
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
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || (user.companyId !== company.id && company.role !== "admin")) {
      return NextResponse.json(
        { error: "User not found" } satisfies ApiResponse,
        { status: 404 }
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

    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
    });

    await recordAudit({
      actorId: company.id,
      actorType: company.role === "admin" ? "admin" : "company",
      action: "user.update",
      targetType: "User",
      targetId: id,
      companyId: user.companyId,
      metadata: parsed.data,
    });

    return NextResponse.json(
      { data: { id: updated.id } } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (err) {
    logger.error("team update failed", err);
    return NextResponse.json(
      { error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
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
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || (user.companyId !== company.id && company.role !== "admin")) {
      return NextResponse.json(
        { error: "User not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    await prisma.user.delete({ where: { id } });
    await recordAudit({
      actorId: company.id,
      actorType: company.role === "admin" ? "admin" : "company",
      action: "user.delete",
      targetType: "User",
      targetId: id,
      companyId: user.companyId,
      metadata: { email: user.email },
    });

    return NextResponse.json(
      { data: { id } } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (err) {
    logger.error("team delete failed", err);
    return NextResponse.json(
      { error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
