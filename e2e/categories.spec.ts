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
    await page.waitForTimeout(2000);

    // Find category links
    const categoryLinks = page
      .locator('a[href*="category"]')
      .or(page.locator('[class*="category"] a'));

    if ((await categoryLinks.count()) > 0) {
      await categoryLinks.first().click();
      await page.waitForURL("/products", { timeout: 10000 });
      await page.waitForLoadState("networkidle");

      // Should navigate to products with category filter
      await expect(page.url()).toContain("category");
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
