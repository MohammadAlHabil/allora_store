"use client";

import { useParams } from "next/navigation";
import { resetPasswordAction } from "../actions";
import { ResetPasswordSchema } from "../schemas";
import { AuthForm } from "./AuthForm";

export function ResetPasswordForm() {
  const searchParams = useParams();
  const token = Array.isArray(searchParams?.token) ? searchParams.token[0] : searchParams?.token;

  const submitAction = async (formData: FormData) => {
    return resetPasswordAction(formData, token);
  };

  return (
    <AuthForm
      schema={ResetPasswordSchema}
      submitAction={submitAction}
      fields={[
        {
          name: "password",
          label: "New Password",
          type: "password",
          placeholder: "Enter new password",
        },
        {
          name: "confirmPassword",
          label: "Confirm Password",
          type: "password",
          placeholder: "Confirm your new password",
        },
      ]}
      submitLabel="Reset Password"
    />
  );
}
