"use client";

/**
 * ═══════════════════════════════════════════════════════════════
 * AddressForm - Address form with map integration
 * ═══════════════════════════════════════════════════════════════
 * Features:
 * - React Hook Form with Zod validation
 * - Map integration for location picking
 * - Auto-fill from map selection
 * - Full CRUD support (create/update)
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type Resolver, Controller } from "react-hook-form";
import { Checkbox } from "@/shared/components/ui/checkbox";
import type { LocationPickerResult } from "../types/address.types";
import { addressSchema, type AddressFormData } from "../validations/address.schema";
import { AddressMapPicker } from "./AddressMapPicker";

interface AddressFormProps {
  initialData?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function AddressForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Save Address",
}: AddressFormProps) {
  const [showMap, setShowMap] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema) as unknown as Resolver<AddressFormData>,
    defaultValues: initialData || {
      label: "Home",
      isDefault: false,
    },
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  /**
   * Handle location selection from map
   */
  const handleLocationSelect = (result: LocationPickerResult) => {
    setValue("latitude", result.latitude);
    setValue("longitude", result.longitude);

    // Auto-fill address fields if available
    if (result.line1) setValue("line1", result.line1);
    if (result.city) setValue("city", result.city);
    if (result.region) setValue("region", result.region);
    if (result.postalCode) setValue("postalCode", result.postalCode);
    if (result.country) setValue("country", result.country);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Label & Contact Info */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">Contact Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              {...register("label")}
              type="text"
              placeholder="e.g., Home, Work, Office"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.label && <p className="text-red-500 text-sm mt-1">{errors.label.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              {...register("phone")}
              type="tel"
              placeholder="+962 7X XXX XXXX"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              {...register("firstName")}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              {...register("lastName")}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Company</label>
          <input
            {...register("company")}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Map Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Location</h3>
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            {showMap ? "Hide Map" : "📍 Pick Location on Map"}
          </button>
        </div>

        {showMap && (
          <AddressMapPicker
            initialPosition={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
            onLocationSelect={handleLocationSelect}
            height="400px"
          />
        )}

        {latitude && longitude && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded-md inline-flex items-center gap-2">
            <span className="font-semibold">✓</span>
            <span>Location selected</span>
          </div>
        )}
      </div>

      {/* Address Fields */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">Delivery Address</h3>

        <div>
          <label className="block text-sm font-medium mb-1">
            Street / Area <span className="text-red-500">*</span>
          </label>
          <input
            {...register("line1")}
            type="text"
            placeholder="Main street or neighborhood"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.line1 && <p className="text-red-500 text-sm mt-1">{errors.line1.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Additional Details (Optional)</label>
          <input
            {...register("line2")}
            type="text"
            placeholder="Landmark or additional info"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Building Name/Number</label>
            <input
              {...register("building")}
              type="text"
              placeholder="e.g., Building A"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Floor Level</label>
            <input
              {...register("floor")}
              type="text"
              placeholder="e.g., 2nd Floor"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Apartment Number</label>
            <input
              {...register("apartment")}
              type="text"
              placeholder="e.g., Apt 5"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              {...register("city")}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">State / Region</label>
            <input
              {...register("region")}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              {...register("postalCode")}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.postalCode && (
              <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              {...register("country")}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Notes */}
      <div>
        <label className="block text-sm font-medium mb-1">Delivery Instructions (Optional)</label>
        <textarea
          {...register("additionalNotes")}
          rows={3}
          placeholder="e.g., Next to the mosque, behind the supermarket..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.additionalNotes && (
          <p className="text-red-500 text-sm mt-1">{errors.additionalNotes.message}</p>
        )}
      </div>

      {/* Default Address Checkbox */}
      <div className="flex items-center">
        <Controller
          name="isDefault"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <Checkbox
                checked={!!field.value}
                onCheckedChange={(val) => field.onChange(!!val)}
                id="isDefault"
              />
              <label htmlFor="isDefault" className="ml-2 text-sm font-medium">
                Set as default address
              </label>
            </div>
          )}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-border">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-2.5 border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground font-medium transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
