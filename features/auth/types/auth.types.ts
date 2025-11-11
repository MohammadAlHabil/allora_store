export type AuthErrorType =
  | "Missing credentials"
  | "Invalid credentials"
  | "Email not verified"
  | "User not found"
  | "Invalid token"
  | "Token expired"
  | "Email already exists"
  | "Server error";

export class AuthError extends Error {
  constructor(public type: AuthErrorType) {
    super(type);
  }
}

export type UserRole = "ADMIN" | "USER";
