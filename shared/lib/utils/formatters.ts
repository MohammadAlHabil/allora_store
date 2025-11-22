/**
 * Formatting utilities for dates, prices, etc.
 */

// Type guard to check if value is a Decimal-like object (e.g., Prisma Decimal)
function isDecimal(value: unknown): value is { toString: () => string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "toString" in value &&
    typeof (value as { toString: unknown }).toString === "function"
  );
}

/**
 * Format price as currency
 */
export function formatPrice(
  amount: number | string | { toString: () => string },
  currency: string = "USD",
  locale: string = "en-US"
): string {
  const numAmount =
    typeof amount === "string"
      ? parseFloat(amount)
      : isDecimal(amount)
        ? parseFloat(amount.toString())
        : amount;

  if (isNaN(numAmount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

/**
 * Format price without currency symbol (just number with decimals)
 */
export function formatPriceNumber(amount: number | string | { toString: () => string }): string {
  const numAmount =
    typeof amount === "string"
      ? parseFloat(amount)
      : isDecimal(amount)
        ? parseFloat(amount.toString())
        : amount;

  if (isNaN(numAmount)) {
    return "0.00";
  }

  return numAmount.toFixed(2);
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number | { toString: () => string },
  decimals: number = 0
): string {
  const numValue: number = isDecimal(value) ? parseFloat(value.toString()) : value;
  return `${numValue.toFixed(decimals)}%`;
}

/**
 * Format date
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  locale: string = "en-US"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  return formatDate(dateObj);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number | string, decimals: number = 0): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return "0";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
}

/**
 * Parse Decimal to number safely
 * Works with Prisma Decimal type or any object with toString() method
 */
export function parseDecimal(
  value: { toString: () => string } | number | string | null | undefined
): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return isNaN(value) ? 0 : value;
  }

  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  if (isDecimal(value)) {
    const parsed = parseFloat(value.toString());
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}
