import { ZodError } from "zod";
import { AnyFieldErrors } from "@/shared/types";

export function mapZodErrors(err: unknown): AnyFieldErrors {
  const out: AnyFieldErrors = {};

  if (err && typeof err === "object" && "flatten" in err) {
    try {
      const zErr = err as ZodError<unknown>;
      const flat = (zErr.flatten().fieldErrors ?? {}) as Record<string, string[] | undefined>;
      for (const key in flat) {
        const v = flat[key];
        out[key] = Array.isArray(v) ? v.join(", ") : undefined;
      }
    } catch {
      // fallthrough to empty out
    }
  }

  return out;
}
