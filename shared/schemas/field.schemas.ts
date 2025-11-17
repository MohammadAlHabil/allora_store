import { z } from "zod";

export const emailSchema = z.string().email("Invalid email").toLowerCase().trim();

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Must contain at least one number.")
  .regex(/[^a-zA-Z0-9]/, "Must contain at least one symbol.")
  .trim();

export const nameSchema = z.string().min(1, "Name is required").max(100, "Name is too long").trim();

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
  .trim();
