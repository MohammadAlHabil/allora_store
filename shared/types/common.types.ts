import type { PrismaClient, Prisma } from "@/app/generated/prisma";

export type FieldErrorMessages = Record<string, string>;

export interface ActionResponse<T = unknown> {
  success: boolean;
  message: string;
  fieldErrors?: FieldErrorMessages;
  data?: T;
}

export type ServiceResponse<T = unknown> = Pick<ActionResponse<T>, "message" | "data">;

export type DB = PrismaClient | Prisma.TransactionClient;
