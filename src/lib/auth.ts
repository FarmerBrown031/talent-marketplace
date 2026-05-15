import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const SALT_ROUNDS = 12;
const SESSION_COOKIE = "company_session";

async function getCookieStore() {
  const { cookies } = await import("next/headers");
  return cookies();
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return compare(password, hash);
}

export async function createSession(companyId: string): Promise<void> {
  const cookieStore = await getCookieStore();
  cookieStore.set(SESSION_COOKIE, companyId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await getCookieStore();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentCompany() {
  const cookieStore = await getCookieStore();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const company = await prisma.company.findUnique({
    where: { id: sessionId },
  });
  return company;
}

export async function requireCompany() {
  const company = await getCurrentCompany();
  if (!company) {
    throw new Error("Unauthorized");
  }
  return company;
}
