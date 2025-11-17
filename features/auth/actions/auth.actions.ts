"use server";

import { signIn } from "@/auth";
import { handleActionError } from "@/shared/lib/error-handler";
import { ActionResponse } from "@/shared/types";
import { SignUpSchema, SignInSchema, ForgotPasswordSchema, ResetPasswordSchema } from "../schemas";
import {
  signupUserService,
  signinUserService,
  verifyEmailService,
  forgotPasswordService,
  resetPasswordService,
} from "../services/auth.service";
import { parseFormData } from "../utils";

// ───────────────────────────────────────────────
// Sign Up
// ───────────────────────────────────────────────
export async function signUpAction(formData: FormData): Promise<ActionResponse<null>> {
  try {
    const validation = parseFormData(formData, SignUpSchema);
    if (!validation.success) return validation.response;

    const { name, email, password } = validation.data;

    await signupUserService(name, email, password);

    return { success: true, message: "Verification email sent" };
  } catch (error) {
    return handleActionError(error, "signUpAction");
  }
}

// ───────────────────────────────────────────────
// Sign In
// ───────────────────────────────────────────────
export async function signInAction(formData: FormData): Promise<ActionResponse> {
  try {
    const validation = parseFormData(formData, SignInSchema);
    if (!validation.success) return validation.response;

    const { email, password } = validation.data;

    await signinUserService(email, password);

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true, message: "Signed in" };
  } catch (error) {
    return handleActionError(error, "signInAction");
  }
}

// ───────────────────────────────────────────────
// Forgot Password
// ───────────────────────────────────────────────
export async function forgotPasswordAction(formData: FormData): Promise<ActionResponse> {
  try {
    const validation = parseFormData(formData, ForgotPasswordSchema);
    if (!validation.success) return validation.response;

    const { email } = validation.data;

    const { message } = await forgotPasswordService(email);

    return { success: true, message };
  } catch (error) {
    return handleActionError(error, "forgotPasswordAction");
  }
}

// ───────────────────────────────────────────────
// Reset Password
// ───────────────────────────────────────────────
export async function resetPasswordAction(
  formData: FormData,
  token: string | undefined
): Promise<ActionResponse> {
  try {
    if (!token) {
      return { success: false, message: "Token is required" };
    }

    const validation = parseFormData(formData, ResetPasswordSchema);
    if (!validation.success) return validation.response;

    const { password } = validation.data;

    const { message } = await resetPasswordService(token, password);

    return { success: true, message };
  } catch (error) {
    return handleActionError(error, "resetPasswordAction");
  }
}

// ───────────────────────────────────────────────
// Verify Email
// ───────────────────────────────────────────────
export async function verifyEmailAction(token: string): Promise<ActionResponse> {
  try {
    if (!token) {
      return { success: false, message: "Token is required" };
    }

    const { message } = await verifyEmailService(token);

    return { success: true, message };
  } catch (error) {
    return handleActionError(error, "verifyEmailAction");
  }
}

// ───────────────────────────────────────────────
// Google OAuth
// ───────────────────────────────────────────────
export async function googleSignInAction(): Promise<void> {
  try {
    await signIn("google");
  } catch (error) {
    handleActionError(error, "googleSignInAction");
  }
}
