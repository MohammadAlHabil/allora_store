"use server";

import type { User } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.error("❌ Error in getUserByEmail:", error);
    return null;
  }
}
