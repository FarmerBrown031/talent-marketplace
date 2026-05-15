import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompany } from "@/lib/auth";
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
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" } satisfies ApiResponse,
      { status: 401 }
    );
  }
}
