import type { VerificationToken, User } from "@/app/generated/prisma";

export type CreateVerificationTokenData = Pick<
  VerificationToken,
  "identifier" | "token" | "expires"
>;
export type CreateUserData = Pick<User, "name" | "email" | "password">;
