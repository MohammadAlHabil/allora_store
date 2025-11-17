# 🚨 Error Management System

نظام احترافي متكامل لإدارة الأخطاء في Next.js Full-Stack Applications.

## 📁 File Structure

```
@/shared/lib/
├── error.types.ts        # Error codes, messages, and types
├── errors.ts             # Error classes
├── error.helpers.ts      # Helper functions (assertions, guards, etc)
├── error-handler.ts      # Error handlers for different contexts
├── logger.ts             # Enhanced logging system
└── index.ts              # Main exports
```

---

## 🎯 Quick Start

### 1. Import from Index

```typescript
import {
  // Error Classes
  ValidationError,
  NotFoundError,
  DatabaseError,

  // Helpers
  assert,
  assertExists,
  tryCatch,

  // Handlers
  handleActionError,
  handleRouteError,

  // Constants
  ERROR_CODES,
} from "@/shared/lib";
```

### 2. Basic Usage

#### ✅ Throwing Errors

```typescript
// Simple validation error
throw new ValidationError("Email is required");

// Not found error
throw new NotFoundError("Product");

// Database error with details
throw new DatabaseError("Query failed", { query: "SELECT ..." });
```

#### ✅ Using Assertions

```typescript
import { assertExists, assertValidEmail, assertPositive } from "@/shared/lib";

// Assert value exists
assertExists(user, ERROR_CODES.NOT_FOUND, "User not found");

// Assert valid email
assertValidEmail(email); // throws InvalidEmailError

// Assert positive number
assertPositive(quantity, "Quantity");
```

#### ✅ Try-Catch Alternative

```typescript
import { tryCatch } from "@/shared/lib";

// Instead of try-catch
const [error, user] = await tryCatch(db.user.findUnique({ where: { id } }));

if (error) {
  throw new DatabaseError("Failed to fetch user", error);
}

assertExists(user);
return user;
```

---

## 🔧 Usage by Context

### 📍 API Route Handlers

```typescript
import { handleRouteError } from "@/shared/lib";

export async function GET(req: Request) {
  try {
    const id = req.url.searchParams.get("id");

    if (!id) {
      throw new ValidationError("ID is required");
    }

    const product = await db.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundError("Product");
    }

    return Response.json({ success: true, data: product });
  } catch (error) {
    return handleRouteError(error, "GET /api/products");
  }
}
```

### 📍 Server Actions

```typescript
import { handleActionError } from "@/shared/lib";

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get("name");

    assertNotEmptyString(name, "Product name");

    const product = await db.product.create({
      data: { name: String(name) },
    });

    return { success: true, data: product };
  } catch (error) {
    return handleActionError(error, "createProduct");
  }
}
```

### 📍 Service Layer

```typescript
import { validateRequiredFields, assertValidEmail, tryCatch, retry } from "@/shared/lib";

export class UserService {
  async createUser(data: CreateUserInput) {
    // Validate all required fields at once
    validateRequiredFields(data, ["email", "password", "name"]);

    // Type-safe email validation
    assertValidEmail(data.email);

    // Check existing user
    const existing = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new AlreadyExistsError("User", data.email);
    }

    // Create with retry on failure
    return retry(() => db.user.create({ data }), { maxAttempts: 3, delayMs: 1000 });
  }
}
```

### 📍 Middleware

```typescript
import { handleError, isAuthError } from "@/shared/lib";

export function middleware(request: NextRequest) {
  try {
    const token = request.cookies.get("session")?.value;

    if (!token) {
      throw new UnauthorizedError("No session token");
    }

    // Verify token...
    return NextResponse.next();
  } catch (error) {
    const errorResponse = handleError(error, { context: "middleware" });

    return NextResponse.json(errorResponse, {
      status: errorResponse.error.status,
    });
  }
}
```

---

## 🎨 Error Types

### Authentication (1xxx)

- `AuthError` - General auth error
- `InvalidCredentialsError` - Wrong email/password
- `InvalidTokenError` - Invalid/expired token
- `TokenExpiredError` - Token expired
- `EmailNotVerifiedError` - Email not verified
- `UnauthorizedError` - Unauthorized access
- `ForbiddenError` - Forbidden access

### Validation (2xxx)

- `ValidationError` - General validation
- `MissingFieldError` - Required field missing
- `InvalidFormatError` - Invalid format
- `InvalidEmailError` - Invalid email
- `WeakPasswordError` - Password too weak

### Database (3xxx)

- `DatabaseError` - General DB error
- `DatabaseConnectionError` - Connection failed
- `QueryFailedError` - Query failed
- `TransactionFailedError` - Transaction failed

### Resources (4xxx)

- `NotFoundError` - Resource not found
- `ConflictError` - Resource conflict
- `AlreadyExistsError` - Resource exists

### Rate Limiting (5xxx)

- `RateLimitError` - Rate limit exceeded
- `TooManyRequestsError` - Too many requests

### Business Logic (6xxx)

- `InsufficientStockError` - Not enough stock
- `PaymentFailedError` - Payment failed
- `OrderCancelledError` - Order cancelled
- `InvalidCouponError` - Invalid coupon

### External Services (7xxx)

- `ExternalServiceError` - External service error
- `PaymentGatewayError` - Payment gateway error
- `EmailServiceError` - Email service error

### General (9xxx)

- `InternalError` - Internal server error
- `NotImplementedError` - Not implemented

---

## 🔍 Type Guards

```typescript
import { isAppError, isOperationalError, isAuthError, isValidationError } from "@/shared/lib";

try {
  // ... operation
} catch (error) {
  if (isAppError(error)) {
    console.log(error.code, error.status);
  }

  if (isAuthError(error)) {
    redirect("/login");
  }

  if (isValidationError(error)) {
    // Show validation errors to user
  }

  if (isOperationalError(error)) {
    // Expected error - log as warning
  } else {
    // Programming error - log as error
  }
}
```

---

## 📊 Logging

```typescript
import { logError, logInfo, logAuth, logPayment, logSecurity, createTimer } from "@/shared/lib";

// Log error with context
logError(error, "user-registration");

// Log info
logInfo("User registered", { userId: user.id });

// Log auth events
logAuth("login", {
  userId: user.id,
  email: user.email,
  success: true,
});

// Log payment events
logPayment("completed", {
  orderId: order.id,
  amount: order.total,
  currency: "USD",
  userId: user.id,
});

// Log security events
logSecurity("suspicious-activity", {
  userId: user.id,
  ip: req.ip,
  severity: "high",
});

// Performance timing
const timer = createTimer("fetch-products", "product-service");
const products = await db.product.findMany();
timer.end({ count: products.length });
```

---

## 🎯 Advanced Patterns

### Retry Logic

```typescript
import { retry } from "@/shared/lib";

const result = await retry(() => fetchFromExternalAPI(), {
  maxAttempts: 3,
  delayMs: 1000,
  backoff: true, // exponential backoff
  onRetry: (attempt, error) => {
    logger.warn(`Retry attempt ${attempt}`, { error });
  },
});
```

### Async Error Wrapper

```typescript
import { asyncErrorWrapper } from "@/shared/lib";

const safeFunction = asyncErrorWrapper(
  async (id: string) => {
    return await db.user.findUnique({ where: { id } });
  },
  (error) => new DatabaseError("Failed to fetch user", error)
);
```

### Combined Validation

```typescript
import { validateRequiredFields, combineValidationErrors } from "@/shared/lib";

const errors: string[] = [];

if (!email.includes("@")) {
  errors.push("Invalid email format");
}

if (password.length < 8) {
  errors.push("Password must be at least 8 characters");
}

if (errors.length > 0) {
  combineValidationErrors(errors);
}
```

---

## 📝 Error Response Format

All errors return consistent format:

```typescript
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Email is required",
    status: 422,
    context: "user-registration",
    details: { field: "email" },
    timestamp: "2025-11-15T10:30:00.000Z"
  }
}
```

---

## 💡 Best Practices

1. **Always use specific error classes** instead of generic AppError
2. **Use helpers** (`assert`, `tryCatch`) for cleaner code
3. **Add context** to all error handlers
4. **Log errors** at the handler level, not in business logic
5. **Use type guards** to handle different error types
6. **Validate early** - throw validation errors before database calls
7. **Don't expose sensitive info** in error messages
8. **Use operational flag** to distinguish expected vs unexpected errors

---

## 🚀 Migration from Old System

### Before:

```typescript
throw new AppError("Email is required", "MISSING_EMAIL", 400);
```

### After:

```typescript
throw new MissingFieldError("email");
// or
assertNotEmptyString(email, "Email");
```

### Before:

```typescript
try {
  const user = await db.user.findUnique({ where: { id } });
} catch (error) {
  throw new DatabaseError("Failed", error);
}
```

### After:

```typescript
const [error, user] = await tryCatch(db.user.findUnique({ where: { id } }));
if (error) throw new DatabaseError("Failed", error);
```

---

## 📚 Resources

- [Error Codes Reference](./error.types.ts)
- [All Error Classes](./errors.ts)
- [Helper Functions](./error.helpers.ts)
- [Handler Functions](./error-handler.ts)

---

**Built with ❤️ for Next.js Full-Stack Applications**
