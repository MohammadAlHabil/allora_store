import { isDev, isTest } from "../constants/constant";

// Simple logger without pino to avoid Turbopack compatibility issues
export const logger = {
  debug: (msg: any, data?: any) => {
    if (!isTest && isDev) {
      console.debug("[DEBUG]", msg, data || "");
    }
  },
  info: (msg: any, data?: any) => {
    if (!isTest) {
      console.info("[INFO]", msg, data || "");
    }
  },
  warn: (msg: any, data?: any) => {
    if (!isTest) {
      console.warn("[WARN]", msg, data || "");
    }
  },
  error: (msg: any, data?: any) => {
    if (!isTest) {
      console.error("[ERROR]", msg, data || "");
    }
  },
};
