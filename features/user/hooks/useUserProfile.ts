import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
  UserProfileResponse,
  UpdateProfileData,
  ChangePasswordData,
} from "../types/user.types";

/**
 * Fetch user profile
 */
async function fetchUserProfile(): Promise<UserProfileResponse> {
  const response = await fetch("/api/user/profile");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch profile");
  }

  return response.json();
}

/**
 * Update user profile
 */
async function updateUserProfile(data: UpdateProfileData): Promise<UserProfileResponse> {
  const response = await fetch("/api/user/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update profile");
  }

  return response.json();
}

/**
 * Change user password
 */
async function changeUserPassword(data: ChangePasswordData): Promise<{ message: string }> {
  const response = await fetch("/api/user/password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to change password");
  }

  return response.json();
}

/**
 * Hook to get user profile
 */
export function useUserProfile() {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["user", "profile"] });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<UserProfileResponse>(["user", "profile"]);

      // Optimistically update
      if (previousProfile) {
        queryClient.setQueryData<UserProfileResponse>(["user", "profile"], {
          ...previousProfile,
          user: {
            ...previousProfile.user,
            ...newData,
          },
        });
      }

      return { previousProfile };
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(["user", "profile"], context.previousProfile);
      }
      toast.error("Failed to update profile", {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: changeUserPassword,
    onSuccess: () => {
      toast.success("Password changed successfully", {
        description: "Your password has been updated",
      });
    },
    onError: (error) => {
      toast.error("Failed to change password", {
        description: error.message,
      });
    },
  });
}
