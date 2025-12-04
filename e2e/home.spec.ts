import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the hero banner", async ({ page }) => {
    // Check for hero banner or main heading
    const heroSection = page.locator("main").first();
    await expect(heroSection).toBeVisible();
  });

  test("should display featured categories section", async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Look for categories section
    const categoriesSection = page.getByText(/featured categories/i).first();
    await expect(categoriesSection).toBeVisible({ timeout: 10000 });
  });

  test("should display new arrivals section", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const newArrivalsSection = page.getByText(/new arrivals/i).first();
    await expect(newArrivalsSection).toBeVisible({ timeout: 10000 });
  });

  test("should display best sellers section", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const bestSellersSection = page.getByText(/best sellers/i).first();
    await expect(bestSellersSection).toBeVisible({ timeout: 10000 });
  });

  test("should have working navigation", async ({ page }) => {
    // Check for navigation links
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Page should still be functional
    const main = page.locator("main").first();
    await expect(main).toBeVisible();
  });
});
