import { SignUpForm } from "@/features/auth/components";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 border rounded-lg">
        <h1 className="text-2xl mb-4">SignUp</h1>
        <SignUpForm />
      </div>
    </div>
  );
}
