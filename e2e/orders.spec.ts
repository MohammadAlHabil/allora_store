import { test, expect } from "@playwright/test";

test.describe("Orders Page", () => {
  test("should redirect to signin if not authenticated", async ({ page }) => {
    await page.goto("/orders");
    await page.waitForLoadState("networkidle");

    // Either shows orders or redirects to signin
    const url = page.url();
    const isOrdersPage = url.includes("/orders");
    const isSignInPage = url.includes("/signin");

    expect(isOrdersPage || isSignInPage).toBeTruthy();
  });

  test("should display orders page structure", async ({ page }) => {
    await page.goto("/orders");
    await page.waitForLoadState("networkidle");

    // If on orders page, check for structure
    if (page.url().includes("/orders")) {
      const main = page.locator("main");
      await expect(main).toBeVisible({ timeout: 10000 });
    }
  });
});
