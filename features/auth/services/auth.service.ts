import prisma from "@/shared/lib/prisma";
import { hashPassword, comparePassword } from "@/shared/lib/utils";
import { sendVerificationEmail, sendResetPasswordEmail } from "@/shared/services/emails.server";
import { ServiceResponse } from "@/shared/types";
import {
  createVerificationToken,
  deleteVerificationToken,
  getVerificationTokenByToken,
} from "../repositories/token.repository";
import {
  createUser,
  getUserByEmail,
  getUserByResetToken,
  updateUserPassword,
  updateUserResetToken,
  verifyUserEmail,
} from "../repositories/user.repository";
import { generateAuthToken, getAuthTokenExpiration } from "../utils/auth.utils";

/** SIGNUP
 *  - check existing user
 *  - hash password
 *  - create user + verification token inside transaction
 *  - send verification email (fire-and-forget)
 */
export async function signupUserService(
  name: string,
  email: string,
  password: string
): Promise<ServiceResponse> {
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error("Email already exists");
  }

  const hashed = await hashPassword(password);

  const token = generateAuthToken();
  const expires = getAuthTokenExpiration();

  await prisma.$transaction(async (tx) => {
    await createUser(tx, { name, email, password: hashed });
    await createVerificationToken(tx, {
      identifier: email,
      token,
      expires,
    });
  });

  sendVerificationEmail(email, token).catch((err) =>
    console.error("sendVerificationEmail failed:", err)
  );

  return {
    message: "Verification email sent",
  };
}

/** SIGNIN
 * - check user by email
 * - compare password
 * - check email verified
 */
export async function signinUserService(email: string, password: string): Promise<ServiceResponse> {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const ok = await comparePassword(password, String(user.password));
  if (!ok) {
    throw new Error("Invalid credentials");
  }

  if (!user.emailVerified) {
    throw new Error("Email not verified");
  }

  return { message: "Signed in" };
}

/** FORGOT PASSWORD
 *  - If email exists -> set reset token + expiry and send reset email
 *  - Always return same message for security
 */
export async function forgotPasswordService(email: string): Promise<ServiceResponse> {
  const genericMessage = { message: "If the email exists, a reset link has been sent" };
  const user = await getUserByEmail(email);
  if (!user) {
    return genericMessage;
  }

  const token = generateAuthToken();
  const expires = getAuthTokenExpiration();

  await updateUserResetToken(user.id, token, expires);

  sendResetPasswordEmail(email, token).catch((err) =>
    console.error("sendResetPasswordEmail failed:", err)
  );

  return genericMessage;
}

/** RESET PASSWORD
 *  - verify reset token maps to a user and is not expired (getUserByResetToken checks expiry)
 *  - hash new password and update user record
 */
export async function resetPasswordService(
  token: string,
  password: string
): Promise<ServiceResponse> {
  const user = await getUserByResetToken(token);
  if (!user) {
    throw new Error("Invalid or expired token");
  }

  const hashed = await hashPassword(password);
  await updateUserPassword(user.id, hashed);

  return { message: "Password reset successful" };
}

/** VERIFY EMAIL
 *  - retrieve token
 *  - check expiry
 *  - inside transaction mark user as verified and delete token
 */
export async function verifyEmailService(token: string): Promise<ServiceResponse> {
  const verificationToken = await getVerificationTokenByToken(token);
  if (!verificationToken) {
    throw new Error("Invalid token");
  }

  if (verificationToken.expires < new Date()) {
    throw new Error("Expired token");
  }

  await prisma.$transaction(async (tx) => {
    await verifyUserEmail(tx, verificationToken.identifier);
    await deleteVerificationToken(tx, verificationToken.token);
  });

  return { message: "Email verified" };
}
