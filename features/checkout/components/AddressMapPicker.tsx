"use client";

/**
 * ═══════════════════════════════════════════════════════════════
 * AddressMapPicker - Interactive map for location selection
 * ═══════════════════════════════════════════════════════════════
 * Features:
 * - OpenStreetMap tiles (free)
 * - Draggable marker for precise location
 * - Search via Nominatim API
 * - Get current location via browser Geolocation API
 * - Reverse geocoding on marker drag
 * - Click to place marker
 */

import type { LeafletMouseEvent, Marker as LeafletMarker } from "leaflet";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// Dynamic imports to avoid SSR issues with Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
// External imports (react-leaflet) should come before local type imports
// useMapEvents must be imported normally, not dynamically
import { useMapEvents as useLeafletMapEvents } from "react-leaflet";
import type { LocationPickerResult } from "../types/address.types";

interface AddressMapPickerProps {
  initialPosition?: { lat: number; lng: number };
  onLocationSelect: (result: LocationPickerResult) => void;
  height?: string;
}

/**
 * Map event handler component
 */
function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useLeafletMapEvents({
    click(e: LeafletMouseEvent) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function AddressMapPicker({
  initialPosition = { lat: 31.9539, lng: 35.9106 }, // Amman, Jordan default
  onLocationSelect,
  height = "400px",
}: AddressMapPickerProps) {
  const [position, setPosition] = useState(initialPosition);
  const [mapKey, setMapKey] = useState(0); // Force map re-render
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const markerRef = useRef<LeafletMarker | null>(null);

  // Fix Leaflet default marker icon issue in Next.js
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Dynamically import Leaflet to avoid SSR issues and avoid using `require()`.
    void (async () => {
      try {
        const L = await import("leaflet");
        // Ensure TypeScript knows about the prototype manipulation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "/leaflet/marker-icon-2x.png",
          iconUrl: "/leaflet/marker-icon.png",
          shadowUrl: "/leaflet/marker-shadow.png",
        });
      } catch (err) {
        // If Leaflet fails to load, log and continue; map will fail gracefully.

        console.error("Failed to load leaflet for icon fix:", err);
      }
    })();
  }, []);

  /**
   * Reverse geocode coordinates to address
   */
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();

      if (data.address) {
        const address = data.address;
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          line1: address.road || address.suburb || "",
          city: address.city || address.town || address.village || "",
          region: address.state || address.region || "",
          country: address.country || "",
          postalCode: address.postcode || "",
        });
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  /**
   * Search for location by query
   */
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&addressdetails=1&limit=1`
      );
      const data = await response.json();

      if (data.length > 0) {
        const result = data[0];
        const newPos = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        };
        setPosition(newPos);
        setMapKey((prev) => prev + 1); // Force map to re-center
        await reverseGeocode(newPos.lat, newPos.lng);
      } else {
        alert("Location not found. Please try a different search.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      alert("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Get current location from browser
   */
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setPosition(newPos);
        setMapKey((prev) => prev + 1); // Force map to re-center
        await reverseGeocode(newPos.lat, newPos.lng);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to get your location. Please enable location services.");
        setIsGettingLocation(false);
      }
    );
  };

  /**
   * Handle map click
   */
  const handleMapClick = async (lat: number, lng: number) => {
    setPosition({ lat, lng });
    await reverseGeocode(lat, lng);
  };

  /**
   * Handle marker drag
   */
  const handleMarkerDrag = async () => {
    const marker = markerRef.current;
    if (marker) {
      const latLng = marker.getLatLng();
      setPosition({ lat: latLng.lat, lng: latLng.lng });
      await reverseGeocode(latLng.lat, latLng.lng);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar & Get Location */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                void handleSearch();
              }
            }}
            placeholder="Search for a location... (e.g., Amman, Jordan)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isSearching || isGettingLocation}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void handleSearch();
            }}
            disabled={isSearching || isGettingLocation}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:bg-gray-200 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation || isSearching}
          className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/5 disabled:bg-gray-100 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isGettingLocation ? "Getting..." : "Current Location"}
        </button>
      </div>

      {/* Status Indicator */}
      {isReverseGeocoding && (
        <div className="text-sm text-gray-600">📍 Getting address details...</div>
      )}

      {/* Map Container */}
      <div
        style={{ height }}
        className="relative rounded-lg overflow-hidden border border-gray-300 shadow-sm"
      >
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={16}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          key={mapKey}
          attributionControl={false}
        >
          <TileLayer attribution="" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker
            position={[position.lat, position.lng]}
            draggable={true}
            eventHandlers={{
              dragend: handleMarkerDrag,
            }}
            ref={markerRef}
          />
          <MapEvents onMapClick={handleMapClick} />
        </MapContainer>
      </div>

      {/* (instructions removed - compact map UI) */}
    </div>
  );
}
