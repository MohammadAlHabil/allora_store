"use client";

/**
 * ═══════════════════════════════════════════════════════════════
 * Address Management Demo Page
 * ═══════════════════════════════════════════════════════════════
 * Demo page to test the complete address flow:
 * - View all addresses
 * - Add new address with map
 * - Edit existing address
 * - Delete address
 * - Set default address
 */

import { useState } from "react";
import { AddressList, AddressForm } from "@/features/checkout/components";
import { useAddAddress, useUpdateAddress } from "@/features/checkout/hooks";
import type { AddressResponse } from "@/features/checkout/types/address.types";
import type { AddressFormData } from "@/features/checkout/validations/address.schema";

type ViewMode = "list" | "add" | "edit";

export default function AddressesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null);

  const { mutate: addAddress, isPending: isAdding } = useAddAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();

  // Handle add new address
  const handleAddSubmit = (data: AddressFormData) => {
    addAddress(data, {
      onSuccess: () => {
        setViewMode("list");
        alert("✅ Address added successfully!");
      },
      onError: (error: unknown) => {
        let msg = "Failed to add address";
        if (typeof error === "string") msg = error;
        else if (error && typeof error === "object" && "message" in error) {
          const m = (error as { message?: unknown }).message;
          if (typeof m === "string") msg = m;
        }
        alert(`❌ ${msg}`);
      },
    });
  };

  // Handle edit address
  const handleEditSubmit = (data: AddressFormData) => {
    if (!editingAddress) return;

    updateAddress(
      { id: editingAddress.id, data },
      {
        onSuccess: () => {
          setViewMode("list");
          setEditingAddress(null);
          alert("✅ Address updated successfully!");
        },
        onError: (error: unknown) => {
          let msg = "Failed to update address";
          if (typeof error === "string") msg = error;
          else if (error && typeof error === "object" && "message" in error) {
            const m = (error as { message?: unknown }).message;
            if (typeof m === "string") msg = m;
          }
          alert(`❌ ${msg}`);
        },
      }
    );
  };

  // Handle edit button click
  const handleEdit = (address: AddressResponse) => {
    setEditingAddress(address);
    setViewMode("edit");
  };

  // Handle cancel
  const handleCancel = () => {
    setViewMode("list");
    setEditingAddress(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📍 Address Management</h1>
          <p className="text-gray-600">
            Manage your delivery addresses with interactive map integration
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {viewMode === "list" && (
            <AddressList onEdit={handleEdit} onAddNew={() => setViewMode("add")} />
          )}

          {viewMode === "add" && (
            <div>
              <div className="mb-6">
                <button
                  onClick={handleCancel}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to Addresses
                </button>
              </div>
              <h2 className="text-2xl font-bold mb-6">Add New Address</h2>
              <AddressForm
                onSubmit={handleAddSubmit}
                onCancel={handleCancel}
                isSubmitting={isAdding}
                submitLabel="Save Address"
              />
            </div>
          )}

          {viewMode === "edit" && editingAddress && (
            <div>
              <div className="mb-6">
                <button
                  onClick={handleCancel}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to Addresses
                </button>
              </div>
              <h2 className="text-2xl font-bold mb-6">Edit Address: {editingAddress.label}</h2>
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
                submitLabel="Update Address"
              />
            </div>
          )}
        </div>

        {/* Features Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">✨ Features</h3>
          <ul className="space-y-2 text-blue-800">
            <li>✓ Interactive map with OpenStreetMap (free)</li>
            <li>✓ Drag marker or click to select location</li>
            <li>✓ Automatic address lookup via Nominatim API</li>
            <li>✓ Detailed address fields (building, floor, apartment)</li>
            <li>✓ Set default address</li>
            <li>✓ Full CRUD operations</li>
            <li>✓ Form validation with Zod</li>
            <li>✓ Optimistic updates with React Query</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
