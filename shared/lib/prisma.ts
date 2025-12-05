import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = global as unknown as {
  prisma_v2: PrismaClient;
};

const prisma = globalForPrisma.prisma_v2 || new PrismaClient().$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v2 = prisma;

export default prisma;
