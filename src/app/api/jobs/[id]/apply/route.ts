import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/lib/types";

const applySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  skills: z.string().min(1, "Skills are required"),
  customAnswers: z
    .array(
      z.object({
        questionLabel: z.string(),
        answer: z.string(),
      })
    )
    .default([]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job || job.status === "closed") {
      return NextResponse.json(
        { error: "Job not found or closed" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = applySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { name, email, phone, skills, customAnswers } = parsed.data;

    let applicant = await prisma.applicant.findFirst({
      where: { email },
    });

    if (!applicant) {
      applicant = await prisma.applicant.create({
        data: {
          name,
          email,
          phone: phone || null,
          skills,
          workHistory: "[]",
        },
      });
    } else {
      applicant = await prisma.applicant.update({
        where: { id: applicant.id },
        data: { name, phone: phone || null, skills },
      });
    }

    const existingApplication = await prisma.application.findUnique({
      where: { jobId_applicantId: { jobId: id, applicantId: applicant.id } },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this job" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        jobId: id,
        applicantId: applicant.id,
        customAnswers: JSON.stringify(customAnswers),
      },
    });

    return NextResponse.json(
      { data: application } satisfies ApiResponse,
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
