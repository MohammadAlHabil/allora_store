import { z } from "zod";

// Schema for selecting a shipping method during checkout
export const selectShippingMethodSchema = z.object({
  addressId: z.string().min(1, "Address is required"),
  shippingMethodId: z.string().min(1, "Shipping method is required"),
});

// Type inference
export type SelectShippingMethodInput = z.infer<typeof selectShippingMethodSchema>;

// Schema for creating/updating shipping methods (admin use)
export const shippingMethodSchema = z.object({
  key: z.string().min(1, "Key is required"),
  name: z.string().min(1, "Name is required"),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  basePrice: z.number().min(0, "Price cannot be negative"),
  currency: z.string().default("EGP"),
  isActive: z.boolean().default(true),
  availableCountries: z.array(z.string()).default(["EG"]),
  estimatedDaysMin: z.number().int().min(1, "Minimum days must be at least 1"),
  estimatedDaysMax: z.number().int().min(1, "Maximum days must be at least 1"),
  rules: z.any().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export type ShippingMethodInput = z.infer<typeof shippingMethodSchema>;
