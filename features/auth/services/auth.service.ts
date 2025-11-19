import {
  AlreadyExistsError,
  InvalidTokenError,
  TokenExpiredError,
} from "@/shared/lib/errors/server";
import prisma from "@/shared/lib/prisma";
import { hashPassword } from "@/shared/lib/utils";
import { sendVerificationEmail, sendResetPasswordEmail } from "@/shared/services/emails.server";
import {
  getVerificationTokenByToken,
  createVerificationToken,
  deleteVerificationToken,
} from "../repositories/token.repository";
import {
  getUserByEmail,
  getUserByResetToken,
  updateUserPassword,
  updateUserResetToken,
  createUser,
  verifyUserEmail,
} from "../repositories/user.repository";
import { generateAuthToken, getAuthTokenExpiration } from "../utils/auth.utils";

/** SIGNUP
 *  - check existing user
 *  - hash password
 *  - create user + verification token inside transaction
 *  - send verification email (fire-and-forget)
 */
export const signupUserService = async (
  name: string,
  email: string,
  password: string
): Promise<void> => {
  const hashed = await hashPassword(password);
  const token = generateAuthToken();
  const expires = getAuthTokenExpiration();

  // Run everything in transaction to prevent race conditions
  // The unique constraint on email will throw if user already exists
  try {
    await prisma.$transaction(async (tx) => {
      await createUser({ name, email, password: hashed }, tx);
      await createVerificationToken({ identifier: email, token, expires }, tx);
    });
  } catch (error) {
    // Check if it's a unique constraint violation
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      throw new AlreadyExistsError("User", email);
    }
    throw error;
  }

  // Send verification email - error will be caught by withAction in action layer
  await sendVerificationEmail(email, token);
};

/** SIGNIN
 * - check user by email
 * - compare password
 * - check email verified
 */
// export const signinUserService = async (email: string, password: string): Promise<void> => {
//   const user = await getUserByEmail(email);

//   if (!user) {
//     throw new InvalidCredentialsError();
//   }

//   const isMatch = await comparePassword(password, String(user.password));
//   if (!isMatch) {
//     throw new InvalidCredentialsError();
//   }

//   if (!user.emailVerified) {
//     throw new EmailNotVerifiedError();
//   }
// };

/** FORGOT PASSWORD
 *  - If email exists -> set reset token + expiry and send reset email
 *  - Always return same message for security
 */
export const forgotPasswordService = async (email: string): Promise<void> => {
  const user = await getUserByEmail(email);

  if (!user) {
    // Return success but no payload for security (don't reveal if email exists)
    return;
  }

  const token = generateAuthToken();
  const expires = getAuthTokenExpiration();

  // Use transaction to ensure atomic update
  await prisma.$transaction(async (tx) => {
    await updateUserResetToken(user.id, token, expires, tx);
  });

  // Send reset password email - error will be caught by withAction in action layer
  await sendResetPasswordEmail(email, token);
};

/** RESET PASSWORD
 *  - verify reset token maps to a user and is not expired (getUserByResetToken checks expiry)
 *  - hash new password and update user record (clears reset token atomically)
 */
export const resetPasswordService = async (token: string, password: string): Promise<void> => {
  const user = await getUserByResetToken(token);

  if (!user) {
    throw new InvalidTokenError("Invalid or expired token");
  }

  const hashed = await hashPassword(password);

  // Use transaction to ensure atomic update
  await prisma.$transaction(async (tx) => {
    await updateUserPassword(user.id, hashed, tx);
  });
};

/** VERIFY EMAIL
 *  - retrieve token
 *  - check expiry
 *  - check if user already verified
 *  - inside transaction mark user as verified and delete token
 */
export const verifyEmailService = async (token: string): Promise<void> => {
  const verificationToken = await getVerificationTokenByToken(token);

  if (!verificationToken) {
    throw new InvalidTokenError(
      "Invalid or expired verification token. Please request a new verification email."
    );
  }

  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await deleteVerificationToken(verificationToken.token);
    throw new TokenExpiredError();
  }

  // Check if user is already verified
  const user = await getUserByEmail(verificationToken.identifier);
  if (user?.emailVerified) {
    // User already verified - delete the token and return success
    await deleteVerificationToken(verificationToken.token);
    return;
  }

  await prisma.$transaction(async (tx) => {
    await verifyUserEmail(verificationToken.identifier, tx);
    await deleteVerificationToken(verificationToken.token, tx);
  });
};
