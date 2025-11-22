import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { ProfilePageContent } from "@/features/user/components/ProfilePageContent";

export const metadata = {
  title: "My Profile | Allora Store",
  description: "Manage your account settings and personal information",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return <ProfilePageContent />;
}
