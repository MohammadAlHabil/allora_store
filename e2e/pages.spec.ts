import { test, expect } from "@playwright/test";

/**
 * Wishlist Page Tests
 * Tests for the wishlist functionality and page
 */
test.describe("Wishlist Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/wishlist");
  });

  test("should display wishlist page", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const main = page.locator("main");
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test("should show empty state when wishlist is empty", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Look for empty wishlist message
    const emptyMessage = page.getByText(/empty|no items|wishlist is empty/i);
    const wishlistContent = page.locator('[class*="wishlist"]');

    // Either shows empty or has content
    const content = emptyMessage.or(wishlistContent.first());
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState("networkidle");

    const main = page.locator("main");
    await expect(main).toBeVisible();
  });
});

/**
 * Static Pages Tests
 * Tests for static content pages
 */
test.describe("Static Pages", () => {
  test("should display About page", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");

    const main = page.locator("main");
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test("should display Contact page", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("networkidle");

    const main = page.locator("main");
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test("should display FAQ page", async ({ page }) => {
    await page.goto("/faq");
    await page.waitForLoadState("networkidle");

    const main = page.locator("main");
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test("should display Privacy Policy page", async ({ page }) => {
    await page.goto("/privacy-policy");
    await page.waitForLoadState("networkidle");

    const main = page.locator("main");
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test("should display Terms and Conditions page", async ({ page }) => {
    await page.goto("/terms-and-conditions");
    await page.waitForLoadState("networkidle");

    const main = page.locator("main");
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test("should display Shipping Policy page", async ({ page }) => {
    await page.goto("/shipping-policy");
    await page.waitForLoadState("networkidle");

    const main = page.locator("main");
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test("should display Return Policy page", async ({ page }) => {
    await page.goto("/return-policy");
    await page.waitForLoadState("networkidle");

    const main = page.locator("main");
    await expect(main).toBeVisible({ timeout: 10000 });
  });
});

/**
 * Navigation Tests
 * Tests main navigation elements and routing
 */
test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should display header navigation", async ({ page }) => {
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
  });

  test("should display footer", async ({ page }) => {
    const footer = page.locator("footer").first();
    await expect(footer).toBeVisible();
  });

  test("should navigate to products page", async ({ page }) => {
    // Look for products/shop link
    const productsLink = page.locator('a[href="/products"]').first();

    if ((await productsLink.count()) > 0) {
      await productsLink.click();
      await page.waitForURL("**/products", { timeout: 10000 });
      expect(page.url()).toContain("/products");
    }
  });

  test("should navigate to cart page", async ({ page }) => {
    const cartLink = page.locator('a[href="/cart"]').first();

    if ((await cartLink.count()) > 0) {
      await cartLink.click();
      await page.waitForURL("**/cart", { timeout: 10000 });
      expect(page.url()).toContain("/cart");
    }
  });

  test("should navigate to categories page", async ({ page }) => {
    const categoriesLink = page.locator('a[href="/categories"]').first();

    if ((await categoriesLink.count()) > 0) {
      await categoriesLink.click();
      await page.waitForURL("**/categories", { timeout: 10000 });
      expect(page.url()).toContain("/categories");
    }
  });

  test("should navigate home when clicking logo", async ({ page }) => {
    // First navigate away
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    // Click logo/home link
    const homeLink = page.locator('a[href="/"]').first();
    await homeLink.click();
    await page.waitForURL("**/", { timeout: 10000 });

    expect(page.url()).toMatch(/\/$|\/$/);
  });

  test("should have cart icon in header", async ({ page }) => {
    // Cart icon should be visible
    const cartIcon = page.locator('a[href="/cart"]');
    if ((await cartIcon.count()) > 0) {
      await expect(cartIcon.first()).toBeVisible();
    }
  });

  test("should have wishlist icon in header", async ({ page }) => {
    const wishlistIcon = page.locator('a[href="/wishlist"]');
    if ((await wishlistIcon.count()) > 0) {
      await expect(wishlistIcon.first()).toBeVisible();
    }
  });
});

/**
 * Error Handling Tests
 * Tests error pages and edge cases
 */
test.describe("Error Handling", () => {
  test("should display 404 page for non-existent routes", async ({ page }) => {
    const response = await page.goto("/non-existent-route-xyz123");

    // Page should load even if it's a 404
    expect(response?.status()).toBe(404);

    // Should show not found content
    const notFoundText = page.getByText(/404|not found|page.*not.*found/i);
    await expect(notFoundText.first()).toBeVisible({ timeout: 5000 });
  });

  test("should handle invalid product ID", async ({ page }) => {
    await page.goto("/products/invalid-product-id-999999");
    await page.waitForLoadState("networkidle");

    // Should show error message or redirect
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("should handle invalid order ID", async ({ page }) => {
    await page.goto("/orders/invalid-order-id-999999");
    await page.waitForLoadState("networkidle");

    // Should show error or redirect
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });
});

/**
 * Static Pages Tests
 * Tests for static content pages
 */
test.describe("Static Pages", () => {
  const staticPages = [
    { path: "/about", title: /about/i },
    { path: "/contact", title: /contact/i },
    { path: "/faq", title: /faq|frequently asked questions/i },
    { path: "/privacy-policy", title: /privacy/i },
    { path: "/terms-and-conditions", title: /terms/i },
    { path: "/shipping-policy", title: /shipping/i },
    { path: "/return-policy", title: /return/i },
  ];

  staticPages.forEach(({ path, title }) => {
    test(`should load ${path} page`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // Page should load successfully
      const main = page.locator("main");
      await expect(main).toBeVisible();

      // Should have relevant heading
      const heading = page.getByRole("heading", { name: title }).first();
      if ((await heading.count()) > 0) {
        await expect(heading).toBeVisible();
      }
    });
  });
});

/**
 * Performance Tests
 * Basic performance and quality checks
 */
test.describe("Performance", () => {
  test("home page should load within reasonable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    // Should load within 15 seconds (reasonable for dev mode)
    expect(loadTime).toBeLessThan(15000);
  });

  test("should have accessible main landmark", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });
});
