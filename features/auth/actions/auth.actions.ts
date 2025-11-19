"use server";

import { signIn } from "@/auth";
import {
  ok,
  type Result,
  ValidationError,
  withAction,
  InvalidCredentialsError,
} from "@/shared/lib/errors/server";
import { parseFormData } from "@/shared/lib/utils";
import { SignUpSchema, SignInSchema, ForgotPasswordSchema, ResetPasswordSchema } from "../schemas";
import {
  signupUserService,
  verifyEmailService,
  forgotPasswordService,
  resetPasswordService,
} from "../services/auth.service";

// ───────────────────────────────────────────────
// Sign Up
// ───────────────────────────────────────────────
export const signUpAction = withAction(async (formData: FormData): Promise<Result<null>> => {
  const validation = parseFormData(formData, SignUpSchema);
  if (!validation.success) return validation;

  const { name, email, password } = validation.data;

  await signupUserService(name, email, password);
  return ok(null, "Account created! Please check your email to verify your account.");
}, "auth.actions.signUp");

// ───────────────────────────────────────────────
// Sign In
// ───────────────────────────────────────────────
export const signInAction = withAction(async (formData: FormData): Promise<Result<null>> => {
  const validation = parseFormData(formData, SignInSchema);
  if (!validation.success) return validation;

  const { email, password } = validation.data;

  try {
    // NextAuth will handle validation via authorize function in auth.config.ts
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return ok(null, "Signed in successfully");
  } catch (error) {
    // NextAuth wraps errors in CallbackRouteError
    // The actual error is in error.cause.err
    if (error instanceof Error) {
      const errorMessage = error.message;
      const errorWithCause = error as Error & {
        cause?: {
          err?: Error;
          message?: string;
        };
      };

      // Extract the actual error message from cause.err or cause.message
      const causeMessage =
        errorWithCause.cause?.err?.message || errorWithCause.cause?.message || "";
      const combinedMessage = errorMessage + " " + causeMessage;

      // Check for specific error codes from authorize function
      if (combinedMessage.includes("EMAIL_NOT_VERIFIED")) {
        throw new ValidationError(
          "Please verify your email before signing in. Check your inbox for the verification link."
        );
      }

      if (combinedMessage.includes("INVALID_CREDENTIALS")) {
        throw new InvalidCredentialsError();
      }

      if (combinedMessage.includes("VALIDATION_ERROR")) {
        throw new ValidationError("Email and password are required");
      }
    }

    // Re-throw the original error if it's not a credentials issue
    throw error;
  }
}, "auth.actions.signIn");

// ───────────────────────────────────────────────
// Forgot Password
// ───────────────────────────────────────────────
export const forgotPasswordAction = withAction(
  async (formData: FormData): Promise<Result<null>> => {
    const validation = parseFormData(formData, ForgotPasswordSchema);
    if (!validation.success) return validation;

    const { email } = validation.data;

    await forgotPasswordService(email);
    return ok(
      null,
      "If an account exists with this email, you will receive password reset instructions."
    );
  },
  "auth.actions.forgotPassword"
);

// ───────────────────────────────────────────────
// Reset Password
// ───────────────────────────────────────────────
export const resetPasswordAction = withAction(
  async (formData: FormData, token: string | undefined): Promise<Result<null>> => {
    if (!token) {
      throw new ValidationError("Token is required");
    }

    const validation = parseFormData(formData, ResetPasswordSchema);
    if (!validation.success) return validation;

    const { password } = validation.data;

    await resetPasswordService(token, password);
    return ok(null, "Password reset successfully. You can now sign in with your new password.");
  },
  "auth.actions.resetPassword"
);

// ───────────────────────────────────────────────
// Verify Email
// ───────────────────────────────────────────────
export const verifyEmailAction = withAction(async (token: string): Promise<Result<null>> => {
  if (!token) {
    throw new ValidationError("Token is required");
  }

  await verifyEmailService(token);
  return ok(null, "Email verified successfully! You can now sign in.");
}, "auth.actions.verifyEmail");

// ───────────────────────────────────────────────
// Google OAuth
// ───────────────────────────────────────────────
export const googleSignInAction = withAction(async () => {
  await signIn("google");
  return ok(null);
}, "auth.actions.googleSignIn");
