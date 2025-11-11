"use client";

import { forgotPasswordAction } from "../actions";
import { ForgotPasswordSchema } from "../validations";
import { AuthForm } from "./AuthForm";

export function ForgotPasswordForm() {
  return (
    <AuthForm
      schema={ForgotPasswordSchema}
      submitAction={forgotPasswordAction}
      fields={[{ name: "email", label: "Email", type: "email", placeholder: "Enter your email" }]}
      submitLabel="Send Reset Link"
    />
  );
}
