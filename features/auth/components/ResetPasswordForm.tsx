"use client";

import { useSearchParams } from "next/navigation";
import { resetPasswordAction } from "../actions";
import { type ResetPasswordFormData } from "../types";
import { ResetPasswordSchema } from "../validations";
import { AuthForm } from "./AuthForm";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const onSubmit = async (data: ResetPasswordFormData) => {
    return resetPasswordAction(new FormData(Object.entries({ ...data, token })), token);
  };

  return (
    <AuthForm
      schema={ResetPasswordSchema}
      onSubmit={onSubmit}
      fields={[
        {
          name: "password",
          label: "New Password",
          type: "password",
          placeholder: "Enter new password",
        },
      ]}
      submitLabel="Reset Password"
    />
  );
}
