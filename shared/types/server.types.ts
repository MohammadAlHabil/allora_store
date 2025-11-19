import type { PrismaClient, Prisma } from "@/app/generated/prisma";

// Server-only types
export type DB = PrismaClient | Prisma.TransactionClient;
