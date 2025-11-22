import Link from "next/link";
import { SignInForm } from "@/features/auth/components/";
import { SignInWithCartMerge } from "@/features/auth/components/SignInWithCartMerge";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center py-30">
      <div className="w-full max-w-md p-8 border rounded-lg">
        <h1 className="text-2xl mb-4">Login</h1>
        {/* <SignInForm /> */}
        <SignInWithCartMerge />
        <span className="block mt-6 text-center text-sm">
          Have no account?{" "}
          <Link href="/signup" className="text-foreground hover:underline">
            Sign Up
          </Link>
        </span>
      </div>
    </div>
  );
}
