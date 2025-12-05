import { PrismaClient } from "../app/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Setting up test user...");

  const hashedPassword = bcrypt.hashSync("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {
      password: hashedPassword,
      emailVerified: new Date("2023-01-01"),
      isActive: true,
    },
    create: {
      id: "user_test",
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      phone: "+10000000099",
      role: "USER",
      isActive: true,
      emailVerified: new Date("2023-01-01"),
    },
  });

  console.log("Test user configured:", user.email);
  console.log("  - emailVerified:", user.emailVerified);
  console.log("  - password hash exists:", !!user.password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
