# Error Handling System - Library README

Internal documentation for the `shared/lib/errors` module. This library provides a consistent error model and helpers used across repositories, services, server actions, and API routes.

Quick import

```ts
import {
  Result,
  ErrorDetails,
  ok,
  fail,
  failValidation,
  isOk,
  isErr,
  NotFoundError,
  AlreadyExistsError,
  ValidationError,
  UnauthorizedError,
  withRepository,
  withService,
  withAction,
  withApiRoute,
  toResponse,
  mapToErrorDetails,
  ERROR_CODES,
  getErrorMessage,
  getErrorStatus,
} from "@/shared/lib/errors";
```

Highlights

- Repository / Service / Action wrappers that return `Result<T>` rather than throwing raw errors
- Automatic mapping from Zod, Prisma, and native JS errors into consistent `AppError` shapes
- Rich set of domain-specific error classes (NotFound, Validation, Database, Auth, etc.)
- Helpers to convert internal errors into HTTP responses (`toResponse`, `withApiRoute`)
- Utilities for assertions and short-circuiting (`assertExists`, `tryCatch`)

Recommended patterns

- Prefer returning `Result<T>` from repository and service functions for predictable flow control
- Use `withApiRoute` / `handleRouteError` in edge/server-route handlers to centralize HTTP mapping
- Keep business logic in services; handle HTTP mapping at the route/action boundary

Where to find more docs

- Design notes and long-form docs: `docs/error.md` and `docs/shared/lib/errors/README.md`
- Implementation files: `shared/lib/errors/*.ts`

Example: a repository wrapper

```ts
export const getUser = withRepository((id: string) => prisma.user.findUnique({ where: { id } }));
```

Example: mapping to HTTP in an API route

```ts
export const GET = withApiRoute(async (request: Request) => {
  try {
    const data = await getUser(someId);
    return toResponse(ok(data));
  } catch (err) {
    return handleRouteError(err, "GET /api/user");
  }
});
```

This README is a quick reference; for architectural rationale and migration notes see `docs/error.md`.
