import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCompany } from "@/lib/auth";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/lib/types";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z
    .string()
    .email()
    .transform((s) => s.trim().toLowerCase())
    .optional(),
  phone: z.string().optional(),
  skills: z.string().min(1).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const company = await requireCompany();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const applicant = await prisma.applicant.findUnique({
      where: { id },
      include: {
        applications: {
          where: { job: { companyId: company.id } },
        },
      },
    });

    if (!applicant || applicant.applications.length === 0) {
      return NextResponse.json(
        { error: "Not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    const updated = await prisma.applicant.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ data: updated } satisfies ApiResponse);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      );
    }
    logger.error("PATCH /api/talent/[id] failed", err);
    return NextResponse.json(
      { error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
