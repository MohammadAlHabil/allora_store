"use client";

import { MapPin, Phone, User, Building2, Home } from "lucide-react";
import type { Address } from "@/app/generated/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

type AddressCardProps = {
  address: Address;
  title: string;
  icon?: React.ReactNode;
};

export function AddressCard({ address, title, icon }: AddressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {icon || <MapPin className="h-5 w-5" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Name */}
        {(address.firstName || address.lastName) && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="font-medium">
              {address.firstName} {address.lastName}
            </p>
          </div>
        )}

        {/* Company */}
        {address.company && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <p>{address.company}</p>
          </div>
        )}

        {/* Phone */}
        {address.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <p>{address.phone}</p>
          </div>
        )}

        {/* Address Lines */}
        <div className="flex items-start gap-2 pt-2">
          <Home className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm">
            <p>{address.line1}</p>
            {address.line2 && <p>{address.line2}</p>}
            {address.apartment && <p>Apartment: {address.apartment}</p>}
            {address.building && <p>Building: {address.building}</p>}
            {address.floor && <p>Floor: {address.floor}</p>}
            <p className="mt-1">
              {address.city}
              {address.region && `, ${address.region}`}
            </p>
            <p>
              {address.postalCode} {address.country}
            </p>
          </div>
        </div>

        {/* Additional Notes */}
        {address.additionalNotes && (
          <div className="pt-2 mt-2 border-t">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Delivery Notes:</span> {address.additionalNotes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
