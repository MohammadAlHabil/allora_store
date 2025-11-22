"use client";

import { Calendar, CheckCircle2, Mail, User as UserIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import Skeleton from "@/shared/components/ui/skeleton";

import type { UserProfile } from "../types/user.types";

interface ProfileHeaderProps {
  user: UserProfile | undefined;
  isLoading?: boolean;
}

export function ProfileHeader({ user, isLoading }: ProfileHeaderProps) {
  if (isLoading || !user) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="mb-6 overflow-hidden border">
      {/* Background Pattern */}
      <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative"></div>

      <CardContent className="p-6 -mt-12">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <Avatar className="w-24 h-24 border-2 border-border">
            <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{user.name || "User"}</h1>
              <div className="flex gap-2">
                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
                {user.emailVerified && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
