import type { Decimal } from "@prisma/client/runtime/library";

/**
 * Address type matching Prisma schema
 */
export interface Address {
  id: string;
  userId: string | null;
  label: string | null;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  phone: string | null;

  // Detailed fields
  line1: string;
  line2: string | null;
  apartment: string | null;
  building: string | null;
  floor: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  country: string;

  // Coordinates
  latitude: Decimal | null;
  longitude: Decimal | null;

  additionalNotes: string | null;
  isDefault: boolean;

  createdAt: Date;
  updatedAt: Date | null;
}

/**
 * Address for API responses (with serialized Decimal)
 */
export interface AddressResponse
  extends Omit<Address, "latitude" | "longitude" | "createdAt" | "updatedAt"> {
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Geocoding result from map
 */
export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  address: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

/**
 * Map location picker result
 */
export interface LocationPickerResult {
  latitude: number;
  longitude: number;
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}
