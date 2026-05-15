import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  await destroySession();
  return NextResponse.redirect(new URL("/company/login", request.url), {
    status: 303,
  });
}
