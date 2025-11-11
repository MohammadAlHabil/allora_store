"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import prisma from "@/shared/lib/prisma";
import { mapZodErrors } from "@/shared/lib/utils/zod.utils";
import { sendVerificationEmail, sendResetPasswordEmail } from "@/shared/services/emails";
import { ActionResponse } from "@/shared/types";
import { AuthError } from "../types";
import {
  SignUpSchema,
  SignInSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "../validations";

export async function signUpAction(formData: FormData): Promise<ActionResponse> {
  const data = Object.fromEntries(formData) as Record<string, unknown>;
  const parsed = SignUpSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: "Validation error",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { success: false, message: "Email already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString("hex");

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: verificationToken,
      expires: new Date(Date.now() + 3600000), // 1 hour
    },
  });

  await sendVerificationEmail(email, verificationToken);

  return { success: true, message: "Verification email sent" };
}

export async function signInAction(formData: FormData): Promise<ActionResponse> {
  const data = Object.fromEntries(formData) as Record<string, unknown>;
  const parsed = SignInSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: "Validation error",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true, message: "Signed in" };
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Server error" };
  }
}

export async function forgotPasswordAction(formData: FormData): Promise<ActionResponse> {
  const data = Object.fromEntries(formData) as Record<string, unknown>;
  const parsed = ForgotPasswordSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: "Validation error",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { success: false, message: "User not found" };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

  // Use Prisma types to satisfy TS while updating optional fields that may exist in DB
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: resetToken, resetTokenExpiry: resetTokenExpiry },
  });

  await sendResetPasswordEmail(email, resetToken);

  return { success: true, message: "Reset email sent" };
}

export async function resetPasswordAction(
  formData: FormData,
  token: string
): Promise<ActionResponse> {
  const data = Object.fromEntries(formData) as Record<string, unknown>;
  const parsed = ResetPasswordSchema.safeParse({ ...data, token });

  if (!parsed.success) {
    return {
      success: false,
      message: "Validation error",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const { password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gte: new Date() } },
  });

  if (!user) {
    return { success: false, message: "Invalid or expired token" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { success: true, message: "Password reset successful" };
}

export async function verifyEmailAction(token: string) {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return { success: false, message: "Invalid or expired token" };
  }

  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.deleteMany({ where: { token } });

  return { success: true, message: "Email verified" };
}

export async function googleSignInAction() {
  await signIn("google");
}
