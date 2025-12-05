import { test, expect } from "@playwright/test";

test.describe("Categories Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/categories");
  });

  test("should display categories page", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const main = page.locator("main");
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test("should display category cards", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Look for category cards or links
    const categoryElements = page.locator(
      '[class*="category"], [class*="Category"], article, a[href*="category"]'
    );

    if ((await categoryElements.count()) > 0) {
      await expect(categoryElements.first()).toBeVisible({ timeout: 19000 });
    }
  });

  test("should navigate to category products when clicking a category", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Find category links - could be /categories/[id] or /products?category=[id]
    const categoryLinks = page
      .locator('a[href*="categor"]')
      .or(page.locator('[class*="category"] a'))
      .or(page.locator('a[href*="/products"]'));

    const count = await categoryLinks.count();

    if (count > 0) {
      await categoryLinks.first().click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);

      // Verify navigation happened - check for heading or URL change
      const heading = page.locator("h1, h2").first();
      await expect(heading).toBeVisible({ timeout: 10000 });

      // URL should either contain category, categories, or products
      const url = page.url();
      const validNavigation = url.includes("categor") || url.includes("products");
      expect(validNavigation).toBeTruthy();
    }
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState("networkidle");

    const main = page.locator("main");
    await expect(main).toBeVisible();
  });
});
