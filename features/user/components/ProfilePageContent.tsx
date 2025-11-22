"use client";

import { History, Settings } from "lucide-react";
import Link from "next/link";

import { OrdersList } from "@/features/orders/components/OrdersList";
import { Button } from "@/shared/components/ui/button";

import { useUserProfile } from "../hooks/useUserProfile";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";

export function ProfilePageContent() {
  const { data, isLoading, error } = useUserProfile();

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Failed to load profile</h2>
          <p className="text-muted-foreground mb-6">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <ProfileHeader user={data?.user} isLoading={isLoading} />

      {/* Profile Stats */}
      {data?.stats && <ProfileStats stats={data.stats} isLoading={isLoading} />}

      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/settings">
          <Button variant="outline" className="w-full h-24 flex-col gap-2" size="lg">
            <Settings className="w-6 h-6" />
            <span className="font-semibold">Account Settings</span>
            <span className="text-xs text-muted-foreground">Manage your profile and security</span>
          </Button>
        </Link>
        <Link href="/orders">
          <Button variant="outline" className="w-full h-24 flex-col gap-2" size="lg">
            <History className="w-6 h-6" />
            <span className="font-semibold">Order History</span>
            <span className="text-xs text-muted-foreground">View all your orders</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
