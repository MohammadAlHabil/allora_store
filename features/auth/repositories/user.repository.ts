import type { User, Prisma } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";
import type { CreateUserData } from "../types";

export async function getUserByEmail(
  email: string,
  tx?: Prisma.TransactionClient
): Promise<User | null> {
  const client = tx ?? prisma;
  return client.user.findUnique({ where: { email } });
}

export async function getUserById(id: string, tx?: Prisma.TransactionClient): Promise<User | null> {
  const client = tx ?? prisma;
  return client.user.findUnique({ where: { id } });
}

export async function getUserByResetToken(
  token: string,
  tx?: Prisma.TransactionClient
): Promise<User | null> {
  const client = tx ?? prisma;
  return client.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });
}

export async function createUser(
  data: CreateUserData,
  tx?: Prisma.TransactionClient
): Promise<User> {
  const client = tx ?? prisma;
  return client.user.create({ data });
}

export async function updateUserResetToken(
  userId: string,
  resetToken: string,
  resetTokenExpiry: Date,
  tx?: Prisma.TransactionClient
): Promise<User> {
  const client = tx ?? prisma;
  return client.user.update({
    where: { id: userId },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });
}

export async function updateUserPassword(
  userId: string,
  hashedPassword: string,
  tx?: Prisma.TransactionClient
): Promise<User> {
  const client = tx ?? prisma;
  return client.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
}

export async function verifyUserEmail(email: string, tx?: Prisma.TransactionClient): Promise<User> {
  const client = tx ?? prisma;
  return client.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });
}
