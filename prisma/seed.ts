import { Prisma } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";

const userData: Prisma.UserCreateInput[] = [
  {
    name: "Alice",
    email: "alicee@prisma.io",
  },
  {
    name: "Bob",
    email: "bobb@prisma.io",
  },
];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main();

console.log("✅ Seeding finished.");
