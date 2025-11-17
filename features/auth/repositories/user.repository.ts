import { User } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";
import { DB } from "@/shared/types";

export type CreateUserData = Pick<User, "name" | "email" | "password">;

export const getUserByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const getUserById = (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

export const getUserByResetToken = (token: string) => {
  return prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });
};

export function createUser(db: DB, data: { name: string; email: string; password: string }) {
  return db.user.create({ data });
}

export function updateUserResetToken(userId: string, resetToken: string, resetTokenExpiry: Date) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });
}

export function updateUserPassword(userId: string, hashedPassword: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
}

export function verifyUserEmail(db: DB, email: string) {
  return db.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });
}
