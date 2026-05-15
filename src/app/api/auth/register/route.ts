import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.company.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const company = await prisma.company.create({
      data: { name, email, passwordHash },
    });

    await createSession(company.id);

    return NextResponse.json(
      { data: { id: company.id, name: company.name, email: company.email } } satisfies ApiResponse,
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
