"use client";

/**
 * ═══════════════════════════════════════════════════════════════
 * AddressStep - Address selection/creation step in checkout
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from "react";
import { AddressList, AddressForm } from "@/features/checkout/components";
import {
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/features/checkout/hooks";
import type { AddressResponse } from "@/features/checkout/types/address.types";
import type { AddressFormData } from "@/features/checkout/validations/address.schema";
import { Button } from "@/shared/components/ui/button";

interface AddressStepProps {
  onAddressSelected: (address: AddressResponse) => void;
  selectedAddressId?: string;
}

export function AddressStep({ onAddressSelected, selectedAddressId }: AddressStepProps) {
  const [mode, setMode] = useState<"select" | "add" | "edit">("select");
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null);

  const { data: result } = useAddresses();
  const { mutate: addAddress, isPending: isAdding } = useAddAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();

  const addresses = result?.success ? result.data : [];
  const hasAddresses = addresses.length > 0;

  // Auto-show form if no addresses
  const shouldShowForm = !hasAddresses || mode === "add" || mode === "edit";

  const handleAddSubmit = (data: AddressFormData) => {
    addAddress(data, {
      onSuccess: (response) => {
        if (response.success) {
          setMode("select");
          onAddressSelected(response.data);
        }
      },
    });
  };

  const handleEditSubmit = (data: AddressFormData) => {
    if (!editingAddress) return;

    updateAddress(
      { id: editingAddress.id, data },
      {
        onSuccess: (response) => {
          if (response.success) {
            setMode("select");
            setEditingAddress(null);
            onAddressSelected(response.data);
          }
        },
      }
    );
  };

  const handleEdit = (address: AddressResponse) => {
    setEditingAddress(address);
    setMode("edit");
  };

  const handleCancel = () => {
    setMode("select");
    setEditingAddress(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Shipping Address</h2>
        <p className="text-sm text-muted-foreground">
          {shouldShowForm ? "Add a new shipping address" : "Select an address or add a new one"}
        </p>
      </div>

      {shouldShowForm ? (
        <div>
          {hasAddresses && (
            <Button variant="ghost" onClick={handleCancel} className="mb-4">
              ← Back to saved addresses
            </Button>
          )}

          {mode === "add" && (
            <AddressForm
              onSubmit={handleAddSubmit}
              onCancel={hasAddresses ? handleCancel : undefined}
              isSubmitting={isAdding}
              submitLabel="Save & Continue"
            />
          )}

          {mode === "edit" && editingAddress && (
            <AddressForm
              initialData={{
                label: editingAddress.label || undefined,
                firstName: editingAddress.firstName || undefined,
                lastName: editingAddress.lastName || undefined,
                company: editingAddress.company || undefined,
                phone: editingAddress.phone || undefined,
                line1: editingAddress.line1,
                line2: editingAddress.line2 || undefined,
                apartment: editingAddress.apartment || undefined,
                building: editingAddress.building || undefined,
                floor: editingAddress.floor || undefined,
                city: editingAddress.city,
                region: editingAddress.region || undefined,
                postalCode: editingAddress.postalCode,
                country: editingAddress.country,
                latitude: editingAddress.latitude || undefined,
                longitude: editingAddress.longitude || undefined,
                additionalNotes: editingAddress.additionalNotes || undefined,
                isDefault: editingAddress.isDefault,
              }}
              onSubmit={handleEditSubmit}
              onCancel={handleCancel}
              isSubmitting={isUpdating}
              submitLabel="Update & Continue"
            />
          )}
        </div>
      ) : (
        <AddressList
          selectable
          onSelect={onAddressSelected}
          selectedId={selectedAddressId}
          onAddNew={() => setMode("add")}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
