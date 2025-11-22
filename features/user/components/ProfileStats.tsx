"use client";

import { Award, Calendar, Heart, MapPin, Package, ShoppingBag } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import Skeleton from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { formatPrice } from "@/shared/lib/utils/formatters";

import type { UserStats } from "../types/user.types";

interface ProfileStatsProps {
  stats: UserStats;
  isLoading?: boolean;
}

const statItems = [
  {
    key: "totalOrders" as const,
    label: "Total Orders",
    icon: Package,
    gradient: "from-blue-500/10 to-blue-600/5",
    iconColor: "text-blue-600",
  },
  {
    key: "completedOrders" as const,
    label: "Completed",
    icon: Award,
    gradient: "from-green-500/10 to-green-600/5",
    iconColor: "text-green-600",
  },
  {
    key: "pendingOrders" as const,
    label: "Pending",
    icon: ShoppingBag,
    gradient: "from-amber-500/10 to-amber-600/5",
    iconColor: "text-amber-600",
  },
  {
    key: "savedAddresses" as const,
    label: "Saved Addresses",
    icon: MapPin,
    gradient: "from-purple-500/10 to-purple-600/5",
    iconColor: "text-purple-600",
  },
  {
    key: "wishlistItems" as const,
    label: "Wishlist Items",
    icon: Heart,
    gradient: "from-pink-500/10 to-pink-600/5",
    iconColor: "text-pink-600",
  },
];

export function ProfileStats({ stats, isLoading }: ProfileStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-10 w-10 rounded-full mb-3" />
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-7 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        const value = stats[item.key];

        return (
          <Card
            key={item.key}
            className="group transition-all duration-300 hover:border-primary/20 cursor-default"
          >
            <CardContent className="p-6">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                  `bg-gradient-to-br ${item.gradient}`
                )}
              >
                <Icon className={cn("w-6 h-6", item.iconColor)} />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{value}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Total Spent - Larger Card */}
      <Card className="col-span-2 md:col-span-3 lg:col-span-5 bg-gradient-to-br from-primary/5 via-primary/5 to-transparent border-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                <p className="text-3xl font-bold">{formatPrice(stats.totalSpent)}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              Lifetime Value
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
