import type { VerificationToken, Prisma } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";
import { CreateVerificationTokenData } from "../types";

export async function createVerificationToken(
  data: CreateVerificationTokenData,
  tx?: Prisma.TransactionClient
): Promise<VerificationToken> {
  const client = tx ?? prisma;
  return client.verificationToken.create({ data });
}

export async function deleteVerificationToken(
  token: string,
  tx?: Prisma.TransactionClient
): Promise<VerificationToken | null> {
  const client = tx ?? prisma;
  try {
    return await client.verificationToken.delete({
      where: { token },
    });
  } catch (error) {
    // If token doesn't exist (already deleted), return null instead of throwing
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return null;
    }
    throw error;
  }
}

export async function getVerificationTokenByToken(
  token: string,
  tx?: Prisma.TransactionClient
): Promise<VerificationToken | null> {
  const client = tx ?? prisma;
  return client.verificationToken.findUnique({
    where: { token },
  });
}
