import { z } from "zod";
import { nameSchema, phoneSchema } from "@/shared/schemas/field.schemas";

/**
 * Schema for updating user profile
 */
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional().or(z.literal("")),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

/**
 * Schema for changing password
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least one symbol"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
