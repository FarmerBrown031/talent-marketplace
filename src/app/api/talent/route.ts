import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompany } from "@/lib/auth";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const company = await requireCompany();

    const applicants = await prisma.applicant.findMany({
      where: {
        applications: {
          some: { job: { companyId: company.id } },
        },
      },
      include: {
        applications: {
          where: { job: { companyId: company.id } },
          include: { job: { select: { title: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: applicants } satisfies ApiResponse);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      );
    }
    logger.error("GET /api/talent failed", err);
    return NextResponse.json(
      { error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
