export const TOKEN_EXPIRATION_DURATION_MS = 1 * 60 * 60 * 1000;
export const BCRYPT_ROUNDS = 12;
export const TOKEN_BYTES = 32;
export const isTest = process.env.NODE_ENV === "test";
export const isProd = process.env.NODE_ENV === "production";
export const isDev = !isProd && !isTest;
