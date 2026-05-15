import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/session";

const PUBLIC_COMPANY_PATHS = ["/company/login", "/company/register"];

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_COMPANY_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    )
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("company_session")?.value;
  const verified = token ? await verifySession(token) : null;

  if (!verified) {
    return NextResponse.redirect(new URL("/company/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/company/:path*"],
};
