import type { ZodSchema, ZodIssue } from "zod";
import { failValidation, type Result } from "../errors";

// Parse and validate FormData using Zod schema
export function parseFormData<T>(formData: FormData, schema: ZodSchema<T>): Result<T> {
  try {
    // Convert FormData to plain object
    const data = Object.fromEntries(formData.entries());
    return safeParseToResult(data, schema);
  } catch (error) {
    return failValidation({
      _form: error instanceof Error ? error.message : "Validation failed",
    });
  }
}

// Parse and validate JSON body using Zod schema
export async function parseJsonBody<T>(request: Request, schema: ZodSchema<T>): Promise<Result<T>> {
  try {
    const body = await request.json();
    return safeParseToResult(body, schema);
  } catch (error) {
    return failValidation({
      _body: error instanceof Error ? error.message : "Invalid JSON",
    });
  }
}

// Validate data using Zod schema (for non-request validation)
export function validateData<T>(data: unknown, schema: ZodSchema<T>): Result<T> {
  return safeParseToResult(data, schema);
}

// =========================
// Helpers
// =========================

function zodIssuesToFieldErrors(issues: ZodIssue[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  issues.forEach((issue) => {
    const field = issue.path.join(".") || "_form";
    // If multiple issues for same field, keep the first message
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
  });
  return fieldErrors;
}

function safeParseToResult<T>(data: unknown, schema: ZodSchema<T>): Result<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const fieldErrors = zodIssuesToFieldErrors(result.error.issues);
    return failValidation(fieldErrors);
  }
  return {
    success: true,
    data: result.data,
  };
}
