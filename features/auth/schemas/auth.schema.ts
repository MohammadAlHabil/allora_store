import { z } from "zod";

import { emailSchema, passwordSchema, nameSchema } from "@/shared/schemas/field.schemas";

export const SignUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const SignInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const ForgotPasswordSchema = z.object({
  email: emailSchema,
});

export const ResetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type TSignUpSchema = z.infer<typeof SignUpSchema>;
export type TSignInSchema = z.infer<typeof SignInSchema>;
export type TForgotPasswordSchema = z.infer<typeof ForgotPasswordSchema>;
export type TResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;
