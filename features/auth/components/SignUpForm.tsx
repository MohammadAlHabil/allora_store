"use client";

import { signUpAction } from "../actions";
import { SignUpSchema } from "../schemas";
import { AuthForm } from "./AuthForm";
import GoogleLoginButton from "./GoogleLoginButton";

export function SignUpForm() {
  return (
    <div className="space-y-4">
      <AuthForm
        schema={SignUpSchema}
        submitAction={signUpAction}
        fields={[
          { name: "name", label: "Name", placeholder: "Enter your name" },
          { name: "email", label: "Email", type: "email", placeholder: "Enter your email" },
          {
            name: "password",
            label: "Password",
            type: "password",
            placeholder: "Enter your password",
          },
        ]}
        submitLabel="Sign Up"
      />
      <GoogleLoginButton className="w-full" />
    </div>
  );
}
