import bcrypt from "bcryptjs";

import { ERROR_CODES } from "@/shared/lib/errors/core/error-codes";
import { fail, ok } from "@/shared/lib/errors/core/result";
import type { Result } from "@/shared/lib/errors/core/types";
import { NotFoundError, UnauthorizedError } from "@/shared/lib/errors/server";

import {
  getUserProfile,
  getUserStats,
  getUserWithPassword,
  updateUserPasswordInDb,
  updateUserProfile,
} from "../repositories/user.repository";
import type {
  ChangePasswordData,
  UpdateProfileData,
  UserProfileResponse,
} from "../types/user.types";

/**
 * Get user profile with stats
 */
export async function getUserProfileService(userId: string): Promise<Result<UserProfileResponse>> {
  try {
    const [user, stats] = await Promise.all([getUserProfile(userId), getUserStats(userId)]);

    if (!user) {
      throw new NotFoundError("User");
    }

    return ok({
      user,
      stats,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return fail({
        code: error.code,
        message: error.message,
        status: error.status,
        timestamp: new Date().toISOString(),
      });
    }

    return fail({
      code: ERROR_CODES.DATABASE_ERROR,
      message: "Failed to fetch user profile",
      status: 500,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Update user profile
 */
export async function updateUserProfileService(
  userId: string,
  data: UpdateProfileData
): Promise<Result<UserProfileResponse>> {
  try {
    const user = await updateUserProfile(userId, data);

    if (!user) {
      throw new NotFoundError("User");
    }

    const stats = await getUserStats(userId);

    return ok({
      user,
      stats,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return fail({
        code: error.code,
        message: error.message,
        status: error.status,
        timestamp: new Date().toISOString(),
      });
    }

    return fail({
      code: ERROR_CODES.DATABASE_ERROR,
      message: "Failed to update profile",
      status: 500,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Change user password
 */
export async function changeUserPasswordService(
  userId: string,
  data: ChangePasswordData
): Promise<Result<{ message: string }>> {
  try {
    // Get user with password
    const user = await getUserWithPassword(userId);

    if (!user || !user.password) {
      throw new NotFoundError("User");
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password
    await updateUserPasswordInDb(userId, hashedPassword);

    return ok({
      message: "Password changed successfully",
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
      return fail({
        code: error.code,
        message: error.message,
        status: error.status,
        timestamp: new Date().toISOString(),
      });
    }

    return fail({
      code: ERROR_CODES.DATABASE_ERROR,
      message: "Failed to change password",
      status: 500,
      timestamp: new Date().toISOString(),
    });
  }
}
