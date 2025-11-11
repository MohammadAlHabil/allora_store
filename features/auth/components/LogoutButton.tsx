"use client";

import { Button } from "@/shared/components/ui/button";
import { useAuth } from "../hooks";

export default function LogoutButton() {
  const { logout } = useAuth();
  return <Button onClick={logout}>Log Out</Button>;
}
