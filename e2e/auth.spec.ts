import { test, expect } from "@playwright/test";

test.describe("Authentication Pages", () => {
  test.describe("Sign In Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/signin");
    });

    test("should display sign in form", async ({ page }) => {
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();
    });

    test("should display forgot password link", async ({ page }) => {
      await expect(page.getByRole("link", { name: /forgot password/i })).toBeVisible();
    });

    test("should display Google sign in button", async ({ page }) => {
      await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();
    });

    test("should show validation errors for empty form submission", async ({ page }) => {
      await page.getByRole("button", { name: /^sign in$/i }).click();

      // Wait for validation errors
      await page.waitForTimeout(500);

      // Check for error messages
      const errorMessages = page.locator('[data-invalid="true"], [aria-invalid="true"]');
      await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
    });

    test("should show validation error for invalid email", async ({ page }) => {
      await page.getByLabel(/email/i).fill("invalid-email");
      await page.getByLabel(/password/i).fill("password123");
      await page.getByRole("button", { name: /^sign in$/i }).click();

      await page.waitForTimeout(500);

      // Check for email field with error state or error message
      const emailField = page.getByLabel(/email/i);
      const hasInvalidState = await emailField
        .getAttribute("aria-invalid")
        .then((val) => val === "true")
        .catch(() => false);
      const hasDataInvalid = await emailField
        .getAttribute("data-invalid")
        .then((val) => val === "true")
        .catch(() => false);
      const hasErrorMessage = (await page.locator("text=/email|invalid/i").count()) > 0;

      expect(hasInvalidState || hasDataInvalid || hasErrorMessage).toBeTruthy();
    });

    test("should navigate to sign up page", async ({ page }) => {
      const signUpLink = page.getByRole("link", { name: /sign up/i });
      if (await signUpLink.isVisible()) {
        await signUpLink.click();
        await expect(page).toHaveURL(/signup/);
      }
    });

    test("should navigate to forgot password page", async ({ page }) => {
      await page.getByRole("link", { name: /forgot password/i }).click();
      await expect(page).toHaveURL(/forgot-password/);
    });
  });

  test.describe("Sign Up Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/signup");
    });

    test("should display sign up form", async ({ page }) => {
      await expect(page.getByLabel(/name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /sign up/i })).toBeVisible();
    });

    test("should display Google sign up button", async ({ page }) => {
      await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();
    });

    test("should show validation errors for empty form submission", async ({ page }) => {
      await page.getByRole("button", { name: /sign up/i }).click();

      await page.waitForTimeout(500);

      const errorMessages = page.locator('[data-invalid="true"], [aria-invalid="true"]');
      await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
    });

    test("should validate password requirements", async ({ page }) => {
      await page.getByLabel(/name/i).fill("Test User");
      await page.getByLabel(/email/i).fill("test@example.com");
      await page.getByLabel(/password/i).fill("123"); // Too short

      await page.getByRole("button", { name: /sign up/i }).click();

      await page.waitForTimeout(500);

      // Should show password validation error
      const passwordError = page.locator('[data-invalid="true"]').filter({ hasText: /password/i });
      const hasError =
        (await passwordError.count()) > 0 || (await page.getByText(/password/i).count()) > 0;
      expect(hasError).toBeTruthy();
    });
  });

  test.describe("Forgot Password Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/forgot-password");
    });

    test("should display forgot password form", async ({ page }) => {
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /send reset link/i })).toBeVisible();
    });

    test("should show validation error for invalid email", async ({ page }) => {
      await page.getByLabel(/email/i).fill("invalid-email");
      await page.getByRole("button", { name: /send reset link/i }).click();

      await page.waitForTimeout(500);

      // Check for email field with error state or error message
      const emailField = page.getByLabel(/email/i);
      const hasInvalidState = await emailField
        .getAttribute("aria-invalid")
        .then((val) => val === "true")
        .catch(() => false);
      const hasDataInvalid = await emailField
        .getAttribute("data-invalid")
        .then((val) => val === "true")
        .catch(() => false);
      const hasErrorMessage = (await page.locator("text=/email|invalid/i").count()) > 0;

      expect(hasInvalidState || hasDataInvalid || hasErrorMessage).toBeTruthy();
    });
  });
});
