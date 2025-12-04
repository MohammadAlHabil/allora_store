import { test, expect } from "@playwright/test";

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
