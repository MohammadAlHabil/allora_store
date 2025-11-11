"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { verifyEmailAction } from "@/features/auth/actions";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useParams();
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token;

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const result = await verifyEmailAction(token);
        if (result.success) {
          toast.success(result.message || "Email verified successfully");
          router.push("/signin");
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        toast.error(message || "Email verification failed");
      }
    };
    verify();
  }, [token, router]);

  return <div>Verifying email...</div>;
}
