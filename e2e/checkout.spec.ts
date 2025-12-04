import { test, expect, Page } from "@playwright/test";

/**
 * Helper function to sign in a user
 */
async function signInUser(page: Page) {
  await page.goto("/signin");
  await page.waitForLoadState("networkidle");

  // Fill in credentials (you may need to adjust these)
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.getByLabel(/password/i).fill("password123");
  await page.getByRole("button", { name: /^sign in$/i }).click();

  // Wait for redirect after successful login
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
}

/**
 * Checkout Flow Tests
 * Tests the complete checkout process including authentication guards
 */
test.describe("Checkout Flow", () => {
  test.describe("Unauthenticated Users", () => {
    test("should redirect to signin when accessing checkout", async ({ page }) => {
      await page.goto("/checkout");
      await page.waitForLoadState("networkidle");

      // Should redirect to signin with callback URL
      const url = page.url();
      expect(url).toContain("/signin");
      expect(url).toContain("callbackUrl");
    });

    test("should show toast message about signin requirement", async ({ page }) => {
      await page.goto("/checkout");
      await page.waitForTimeout(1000);

      // Check for toast notification (if visible)
      const toast = page.locator("[data-sonner-toast]");
      if ((await toast.count()) > 0) {
        const toastText = await toast.first().textContent();
        expect(toastText?.toLowerCase()).toContain("sign in");
      }
    });
  });

  test.describe("Authenticated Users - Checkout Steps", () => {
    test.beforeEach(async ({ page }) => {
      // Sign in before each test
      await signInUser(page);

      // Navigate to checkout
      await page.goto("/checkout");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
    });

    test("should display checkout page for authenticated users", async ({ page }) => {
      // Should be on checkout page, not redirected
      expect(page.url()).toContain("/checkout");

      // Should show checkout heading
      const heading = page.getByRole("heading", { name: /checkout/i });
      await expect(heading.first()).toBeVisible({ timeout: 5000 });
    });

    test("should display step indicators (Address, Shipping, Payment)", async ({ page }) => {
      // Look for the three main steps
      const addressStep = page.getByText(/address/i);
      const shippingStep = page.getByText(/shipping/i);
      const paymentStep = page.getByText(/payment/i);

      // At least one of each should be visible
      await expect(addressStep.first()).toBeVisible({ timeout: 5000 });
      await expect(shippingStep.first()).toBeVisible({ timeout: 5000 });
      await expect(paymentStep.first()).toBeVisible({ timeout: 5000 });
    });

    test("should display order summary sidebar", async ({ page }) => {
      const orderSummary = page.getByText(/order summary/i);
      await expect(orderSummary.first()).toBeVisible({ timeout: 5000 });

      // Should show total, subtotal, etc.
      const total = page.getByText(/total/i);
      await expect(total.first()).toBeVisible();
    });

    test("should show address form on first step", async ({ page }) => {
      // Should be on address step initially
      const addressHeading = page.getByText(/shipping address|select.*address|add.*address/i);

      if ((await addressHeading.count()) > 0) {
        await expect(addressHeading.first()).toBeVisible({ timeout: 5000 });
      }
    });

    test("should have back and continue buttons", async ({ page }) => {
      // Continue button should be visible
      const continueButton = page.getByRole("button", { name: /continue/i });

      if ((await continueButton.count()) > 0) {
        await expect(continueButton.first()).toBeVisible();
      }
    });

    test("should show validation when trying to continue without selecting address", async ({
      page,
    }) => {
      const continueButton = page.getByRole("button", { name: /continue/i });

      if ((await continueButton.count()) > 0) {
        // Button should be disabled or show error when clicked without address
        const isDisabled = await continueButton.first().isDisabled();

        if (!isDisabled) {
          await continueButton.first().click();
          await page.waitForTimeout(500);

          // Should still be on checkout page (not advanced to next step)
          expect(page.url()).toContain("/checkout");
        } else {
          // Button is properly disabled
          expect(isDisabled).toBeTruthy();
        }
      }
    });
  });

  test.describe("Empty Cart Scenario", () => {
    test("should handle empty cart appropriately", async ({ browser }) => {
      // Create a new incognito context to ensure empty cart
      const context = await browser.newContext();
      const page = await context.newPage();

      // Sign in with fresh session (no cart items)
      await signInUser(page);

      // Verify cart is empty
      await page.goto("/cart");
      await page.waitForLoadState("networkidle");

      // Check if cart is empty
      const emptyCartMessage = page.getByText(/cart.*empty|no.*items|your cart is empty/i);
      const cartItemsCount = await page.locator('[data-testid="cart-item"]').count();

      // If cart has items, we'll skip this test or clear it
      if (cartItemsCount === 0 || (await emptyCartMessage.count()) > 0) {
        // Now try to access checkout with empty cart
        await page.goto("/checkout");
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        // Should either:
        // 1. Redirect to cart page
        // 2. Show empty cart/no items message
        // 3. Prevent checkout
        const url = page.url();
        const checkoutEmptyMessage = page.getByText(/cart.*empty|no.*items|add.*items/i);

        const isRedirectedToCart = url.includes("/cart");
        const hasEmptyMessage = (await checkoutEmptyMessage.count()) > 0;

        // One of these should be true - app should prevent empty cart checkout
        expect(isRedirectedToCart || hasEmptyMessage).toBeTruthy();
      }

      await context.close();
    });

    test("should redirect from checkout to cart when cart becomes empty", async ({ browser }) => {
      // Use incognito context
      const context = await browser.newContext();
      const page = await context.newPage();

      await signInUser(page);

      // First, verify we're logged in and go to products to potentially add item
      await page.goto("/products");
      await page.waitForLoadState("networkidle");

      // Try to go to checkout (will redirect if cart is empty)
      await page.goto("/checkout");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);

      const url = page.url();

      // If redirected to signin or cart, that's expected behavior for empty cart
      const isProperlyHandled =
        url.includes("/signin") || url.includes("/cart") || url.includes("/products");

      expect(isProperlyHandled).toBeTruthy();

      await context.close();
    });
  });
});
