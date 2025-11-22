import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { SettingsPageContent } from "@/features/user/components/SettingsPageContent";

export const metadata = {
  title: "Settings | Allora Store",
  description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return <SettingsPageContent />;
}
