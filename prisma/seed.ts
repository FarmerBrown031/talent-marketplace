import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "pk.ngoie@gmail.com";
const ADMIN_PASSWORD = "12345678";
const ADMIN_NAME = "Platform Admin";

async function main(): Promise<void> {
  const existing = await prisma.company.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  const passwordHash = await hash(ADMIN_PASSWORD, 12);

  if (existing) {
    await prisma.company.update({
      where: { id: existing.id },
      data: { role: "admin", passwordHash, name: ADMIN_NAME },
    });
    process.stdout.write(`Updated admin: ${ADMIN_EMAIL}\n`);
  } else {
    await prisma.company.create({
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        passwordHash,
        role: "admin",
      },
    });
    process.stdout.write(`Created admin: ${ADMIN_EMAIL}\n`);
  }

  await prisma.application.updateMany({
    where: { status: "new" },
    data: { status: "applied" },
  });

  await prisma.application.updateMany({
    where: { status: "reviewed" },
    data: { status: "screening" },
  });
}

main()
  .catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Seed failed: ${message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
