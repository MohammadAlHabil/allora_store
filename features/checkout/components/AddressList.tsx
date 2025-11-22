"use client";

/**
 * ═══════════════════════════════════════════════════════════════
 * AddressList - Display and manage user addresses
 * ═══════════════════════════════════════════════════════════════
 * Features:
 * - List all saved addresses
 * - Edit/Delete/Set Default actions
 * - Default address badge
 * - Responsive grid layout
 * - Loading and error states
 */

import { Star, Edit3, Trash2, Check, Phone, MapPin, MoreVertical } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from "../hooks";
import type { AddressResponse } from "../types/address.types";

interface AddressListProps {
  onEdit?: (address: AddressResponse) => void;
  onAddNew?: () => void;
  selectable?: boolean;
  onSelect?: (address: AddressResponse) => void;
  selectedId?: string;
}

export function AddressList({
  onEdit,
  onAddNew,
  selectable = false,
  onSelect,
  selectedId,
}: AddressListProps) {
  const { data: result, isLoading, error, refetch } = useAddresses();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();
  const { mutate: setDefaultAddress, isPending: isSettingDefault } = useSetDefaultAddress();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Handle delete with confirmation
  const handleDelete = (id: string, label: string) => {
    if (window.confirm(`Are you sure you want to delete "${label}" address?`)) {
      setDeletingId(id);
      deleteAddress(id, {
        onSuccess: () => {
          setDeletingId(null);
        },
        onError: () => {
          setDeletingId(null);
          alert("Failed to delete address. Please try again.");
        },
      });
    }
  };

  // Handle set default
  const handleSetDefault = (id: string) => {
    setDefaultAddress(id, {
      onError: () => {
        alert("Failed to set default address. Please try again.");
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">Failed to load addresses</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const addresses = result?.success ? result.data : [];

  // Empty state
  if (addresses.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <div className="text-6xl mb-4">📍</div>
        <h3 className="text-xl font-semibold mb-2">No Addresses Yet</h3>
        <p className="text-gray-600 mb-6">Add your first delivery address to get started</p>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            + Add Address
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          Saved Addresses ({addresses.length})
        </h3>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium transition-colors"
          >
            + Add New
          </button>
        )}
      </div>

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addresses.map((address: AddressResponse) => (
          <div
            key={address.id}
            className={`
              relative border rounded-lg p-4 transition-all
              ${
                selectable && selectedId === address.id
                  ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:shadow-sm"
              }
              ${selectable ? "cursor-pointer" : ""}
              ${deletingId === address.id ? "opacity-50 pointer-events-none" : ""}
            `}
            onClick={() => selectable && onSelect?.(address)}
          >
            {/* Header with Label and Actions */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <h4 className="text-base font-semibold text-foreground truncate">
                  {address.label || "Address"}
                </h4>
                {address.isDefault && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 flex-shrink-0">
                    <Star className="w-3 h-3 fill-orange-600" />
                  </span>
                )}
              </div>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors flex-shrink-0"
                    aria-label="Address options"
                  >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {!address.isDefault && (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(address.id);
                        }}
                        disabled={isSettingDefault}
                      >
                        <Star className="w-4 h-4 mr-2 text-orange-600" />
                        Set as Default
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(address);
                      }}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Address
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(address.id, address.label || "Address");
                    }}
                    disabled={isDeleting && deletingId === address.id}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2 text-destructive" />
                    Delete Address
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-3">
              {(address.firstName || address.lastName) && (
                <p className="text-sm font-medium text-foreground">
                  {address.firstName} {address.lastName}
                </p>
              )}
              {address.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{address.phone}</span>
                </div>
              )}
            </div>

            {/* Address Details */}
            <div className="text-sm text-muted-foreground space-y-1.5">
              <p className="text-foreground font-medium">{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}

              {/* Building Details */}
              {(address.apartment || address.building || address.floor) && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs bg-muted/50 px-2 py-1.5 rounded">
                  {address.building && <span>🏢 Building {address.building}</span>}
                  {address.floor && <span>🔼 Floor {address.floor}</span>}
                  {address.apartment && <span>🚪 Apt {address.apartment}</span>}
                </div>
              )}

              {/* City and Region */}
              <p className="text-foreground">
                {address.city}
                {address.region && `, ${address.region}`}
              </p>

              {/* Postal Code and Country */}
              <p>
                {address.postalCode} • {address.country}
              </p>
            </div>

            {/* Additional Notes */}
            {address.additionalNotes && (
              <div className="mt-3 text-xs text-muted-foreground bg-muted/50 p-2.5 rounded border-l-2 border-primary/30">
                <span className="font-medium">Note:</span> {address.additionalNotes}
              </div>
            )}

            {/* Selected Indicator for selectable mode */}
            {selectable && selectedId === address.id && (
              <div className="absolute bottom-3 right-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                  <Check className="w-4 h-4 text-primary-foreground font-bold" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
