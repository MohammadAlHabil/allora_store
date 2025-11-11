import { ResetPasswordForm } from "@/features/auth/components";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 border rounded-lg">
        <h1 className="text-2xl mb-4">Reset Password</h1>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
