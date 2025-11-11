import { useSession, signIn, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const googleSignIn = () => signIn("google");
  const logout = () => signOut();

  return { session, isLoading, googleSignIn, logout };
}
