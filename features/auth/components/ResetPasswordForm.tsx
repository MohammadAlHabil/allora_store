"use client";

import { useSearchParams } from "next/navigation";
import { resetPasswordAction } from "../actions";
import { ResetPasswordSchema } from "../validations";
import { AuthForm } from "./AuthForm";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  // wrap the server action so it receives the token from the URL
  const submitAction = async (formData: FormData) => {
    // forward formData and token to the server action
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
