"use client";

import { signInAction } from "../actions";
import { SignInSchema } from "../validations";
import { AuthForm } from "./AuthForm";
import GoogleLoginButton from "./GoogleLoginButton";

export function SignInForm() {
  return (
    <div className="space-y-4">
      <AuthForm
        schema={SignInSchema}
        submitAction={signInAction}
        fields={[
          { name: "email", label: "Email", type: "email", placeholder: "Enter your email" },
          {
            name: "password",
            label: "Password",
            type: "password",
            placeholder: "Enter your password",
          },
        ]}
        submitLabel="Sign In"
      />
      <GoogleLoginButton className="w-full" />
    </div>
  );
}
