import type { UserRole } from "@/app/generated/prisma";

/**
 * User profile data from database
 */
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  role: UserRole;
  emailVerified: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

/**
 * User profile update data
 */
export interface UpdateProfileData {
  name?: string;
  phone?: string;
  image?: string;
}

/**
 * Password change data
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * User stats for profile dashboard
 */
export interface UserStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
  savedAddresses: number;
  wishlistItems: number;
}

/**
 * User profile response
 */
export interface UserProfileResponse {
  user: UserProfile;
  stats: UserStats;
}
