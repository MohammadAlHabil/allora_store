"use client";

import { Lock, User } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import { useUserProfile } from "../hooks/useUserProfile";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { ProfileForm } from "./ProfileForm";

export function SettingsPageContent() {
  const { data, error } = useUserProfile();

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Failed to load settings</h2>
          <p className="text-muted-foreground mb-6">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          {data?.user && <ProfileForm user={data.user} />}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <PasswordChangeForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
