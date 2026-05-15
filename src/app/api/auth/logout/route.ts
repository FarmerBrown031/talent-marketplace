import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function GET() {
  await destroySession();
  return NextResponse.redirect(
    new URL("/company/login", process.env.NEXT_PUBLIC_APP_URL)
  );
}

export async function POST() {
  await destroySession();
  return NextResponse.redirect(
    new URL("/company/login", process.env.NEXT_PUBLIC_APP_URL)
  );
}
