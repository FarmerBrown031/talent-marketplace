import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCompany } from "@/lib/auth";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/lib/types";

const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["remote", "onsite", "hybrid"]),
  customQuestions: z
    .array(
      z.object({
        label: z.string().min(1),
        type: z.enum(["text", "textarea", "file"]),
      })
    )
    .default([]),
});

export async function GET() {
  try {
    const company = await requireCompany();
    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: jobs } satisfies ApiResponse);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      );
    }
    logger.error("GET /api/jobs failed", err);
    return NextResponse.json(
      { error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const company = await requireCompany();
    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { title, description, location, type, customQuestions } = parsed.data;

    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title,
        description,
        location,
        type,
        customQuestions: JSON.stringify(customQuestions),
      },
    });

    return NextResponse.json({ data: job } satisfies ApiResponse, {
      status: 201,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" } satisfies ApiResponse,
        { status: 401 }
      );
    }
    logger.error("POST /api/jobs failed", err);
    return NextResponse.json(
      { error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
