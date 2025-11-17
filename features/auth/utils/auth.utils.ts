import { TOKEN_BYTES, TOKEN_EXPIRATION_DURATION_MS } from "@/shared/constants/constant";
import { generateSecureToken } from "@/shared/lib/utils";

export function generateAuthToken(): string {
  return generateSecureToken(TOKEN_BYTES);
}

export function getAuthTokenExpiration(): Date {
  return new Date(Date.now() + TOKEN_EXPIRATION_DURATION_MS);
}
