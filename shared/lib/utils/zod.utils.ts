import { ZodError } from "zod";
import { FieldErrorMessages } from "@/shared/types";

export function mapZodErrors(error: ZodError): FieldErrorMessages {
  const fieldErrors: FieldErrorMessages = {};

  const flattened = error.flatten().fieldErrors;

  // Original implementation that kept multiple messages as an array
  // for (const [key, value] of Object.entries(flattened)) {
  //   if (Array.isArray(value) && value.length > 0) {
  //     fieldErrors[key] = value.filter((msg): msg is string => msg !== undefined && msg !== null);
  //   }
  // }

  // Join multiple error messages into a single string per field
  for (const [key, value] of Object.entries(flattened)) {
    if (Array.isArray(value) && value.length > 0) {
      const messages = value.filter((msg): msg is string => msg !== undefined && msg !== null);
      fieldErrors[key] = messages.join(", ");
    }
  }

  return fieldErrors;
}
