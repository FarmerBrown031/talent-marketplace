import { compare, hash } from "bcryptjs";
import type { Company } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  signSession,
  verifySession,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/session";

const SALT_ROUNDS = 12;
export const SESSION_COOKIE = "company_session";

async function getCookieStore() {
  const { cookies } = await import("next/headers");
  return cookies();
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return compare(password, hashed);
}

export async function createSession(companyId: string): Promise<void> {
  const token = await signSession(companyId);
  const cookieStore = await getCookieStore();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await getCookieStore();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentCompany(): Promise<Company | null> {
  const cookieStore = await getCookieStore();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const verified = await verifySession(token);
  if (!verified) return null;

  const company = await prisma.company.findUnique({
    where: { id: verified.companyId },
  });
  return company;
}

export async function requireCompany(): Promise<Company> {
  const company = await getCurrentCompany();
  if (!company) {
    throw new Error("Unauthorized");
  }
  return company;
}

export async function requireAdmin(): Promise<Company> {
  const company = await getCurrentCompany();
  if (!company || company.role !== "admin") {
    throw new Error("Forbidden");
  }
  return company;
}

export function isAdmin(company: Pick<Company, "role"> | null): boolean {
  return company?.role === "admin";
}
