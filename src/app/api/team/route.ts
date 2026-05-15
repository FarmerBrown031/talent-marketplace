import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/lib/types";

const createSchema = z.object({
  name: z.string().min(1, "Name is required").transform((s) => s.trim()),
  email: z
    .string()
    .email("Invalid email")
    .transform((s) => s.trim().toLowerCase()),
  role: z.enum(["owner", "member", "viewer"]).default("member"),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const company = await getCurrentCompany();
    if (!company) {
      return NextResponse.json(
        { error: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { name, email, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A user with that email already exists" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: { companyId: company.id, name, email, role, status: "invited" },
    });

    await recordAudit({
      actorId: company.id,
      actorType: company.role === "admin" ? "admin" : "company",
      action: "user.invite",
      targetType: "User",
      targetId: user.id,
      companyId: company.id,
      metadata: { email, role },
    });

    return NextResponse.json(
      { data: { id: user.id } } satisfies ApiResponse,
      { status: 201 }
    );
  } catch (err) {
    logger.error("team invite failed", err);
    return NextResponse.json(
      { error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
