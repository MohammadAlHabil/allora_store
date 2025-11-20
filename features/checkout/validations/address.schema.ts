import { z } from "zod";

/**
 * Address validation schema
 * Supports detailed address fields for better UX
 */
export const addressSchema = z.object({
  label: z.string().min(1, "Label is required (e.g., Home, Work, Office)").max(50),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[+]?[\d\s()-]+$/, "Invalid phone format"),

  // Detailed address fields
  line1: z.string().min(1, "Street/Area is required"),
  line2: z.string().optional(),
  apartment: z.string().optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  city: z.string().min(1, "City is required"),
  region: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(2, "Country is required"),

  // Map coordinates
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  // Additional notes for delivery
  additionalNotes: z.string().max(500).optional(),

  isDefault: z.boolean().optional().default(false),
});

export type AddressFormData = z.infer<typeof addressSchema>;

/**
 * Partial schema for updating address
 */
export const updateAddressSchema = addressSchema.partial();
