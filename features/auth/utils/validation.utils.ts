import { ZodSchema } from "zod";
import { mapZodErrors } from "@/shared/lib/utils/zod.utils";
import { ActionResponse } from "@/shared/types";

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; response: ActionResponse<null> };

export function parseFormData<T>(formData: FormData, schema: ZodSchema<T>): ParseResult<T> {
  const data = Object.fromEntries(formData) as Record<string, unknown>;
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      response: {
        success: false,
        message: "Validation error",
        fieldErrors: mapZodErrors(parsed.error),
      },
    };
  }

  return { success: true, data: parsed.data };
}
