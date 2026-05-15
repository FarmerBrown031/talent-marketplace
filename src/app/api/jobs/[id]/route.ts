import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCompany } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  type: z.enum(["remote", "onsite", "hybrid"]).optional(),
  status: z.enum(["open", "closed"]).optional(),
  customQuestions: z
    .array(
      z.object({
        label: z.string().min(1),
        type: z.enum(["text", "textarea", "file"]),
      })
    )
    .optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await prisma.job.findUnique({
      where: { id },
      include: { company: { select: { name: true } } },
    });

    if (!job || job.status === "closed") {
      return NextResponse.json(
        { error: "Not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({ data: job } satisfies ApiResponse);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

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

    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing || existing.companyId !== company.id) {
      return NextResponse.json(
        { error: "Not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.customQuestions) {
      updateData.customQuestions = JSON.stringify(updateData.customQuestions);
    }

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: job } satisfies ApiResponse);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
