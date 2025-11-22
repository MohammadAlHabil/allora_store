# Error Management System

This document summarizes the centralized error handling system used across the codebase. It provides a consistent way to produce, map, and convert errors into user-friendly responses.

Overview

- Centralized error classes: `ValidationError`, `NotFoundError`, `DatabaseError`, etc.
- Assertion helpers: `assertExists`, `assertValidEmail`, `assertPositive`, etc.
- Layer wrappers: `withRepository`, `withService`, `withAction`, `withApiRoute`
- Unified `Result<T>` pattern and helpers: `ok`, `fail`, `failValidation`
- Automatic mapping for Zod, Prisma, and native errors

Quick import

```ts
import {
  ValidationError,
  NotFoundError,
  assertExists,
  tryCatch,
  handleRouteError,
  ERROR_CODES,
} from "@/shared/lib/errors";
```

Common usage patterns

1. Repository wrapper - returns `Result<T>` and handles DB errors:

```ts
export const getUser = withRepository((id: string) => prisma.user.findUnique({ where: { id } }));
```

2. Service wrapper - business logic with consistent error returns:

```ts
export const createUserService = withService(async (data: UserData) => {
  const existing = await getUserByEmail(data.email);
  if (!existing.success) return existing;
  if (existing.data) throw new AlreadyExistsError("Email");

  return await createUser(data);
});
```

3. Action example - validate, then call service:

```ts
export async function signUpAction(formData: FormData) {
  const parsed = parseFormData(formData, SignUpSchema);
  if (!parsed.success) return failValidation(parsed.errors);

  return await createUserService(parsed.data);
}
```

4. API route integration - convert to HTTP response with `withApiRoute`/`handleRouteError`:

```ts
export const GET = withApiRoute(async (request: Request) => {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return fail({ code: "VALIDATION_ERROR", message: "ID is required" });

  return await getUser(id);
});
```

Files & further docs

Detailed design notes and the library README live under `shared/lib/errors/` and `docs/shared/lib/errors/README.md`.

Why this helps

- Consistent error shapes across repository, services, actions, and routes
- Easier unit testing and instrumentation
- Clear mapping from technical error to user-facing message
