import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/lib/types";

const schema = z.object({
  email: z
    .string()
    .email("Invalid email")
    .transform((s) => s.trim().toLowerCase()),
  password: z.string().min(1, "Password is required"),
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

    const { email, password } = parsed.data;

    const company = await prisma.company.findUnique({ where: { email } });
    if (!company) {
      return NextResponse.json(
        { error: "Invalid email or password" } satisfies ApiResponse,
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, company.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" } satisfies ApiResponse,
        { status: 401 }
      );
    }

    await createSession(company.id);

    return NextResponse.json(
      { data: { id: company.id, name: company.name, email: company.email } } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (err) {
    logger.error("login route failed", err);
    return NextResponse.json(
      { error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
