import { VerificationToken } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";
import { DB } from "@/shared/types";

export type CreateVerificationTokenData = Pick<
  VerificationToken,
  "identifier" | "token" | "expires"
>;

export function createVerificationToken(
  db: DB,
  data: { identifier: string; token: string; expires: Date }
) {
  return db.verificationToken.create({ data });
}

export function deleteVerificationToken(db: DB, token: string) {
  return db.verificationToken.delete({
    where: { token },
  });
}

export function getVerificationTokenByToken(token: string) {
  return prisma.verificationToken.findUnique({
    where: { token },
  });
}
