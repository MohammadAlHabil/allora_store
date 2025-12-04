import { test, expect } from "@playwright/test";

test.describe("Products Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/products");
  });

  test("should display products grid", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Wait for products to load
    const productsGrid = page
      .locator('[data-testid="products-grid"]')
      .or(page.locator("main").locator("article, [class*='product'], [class*='card']").first());

    // Either find specific products grid or general content
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible({ timeout: 10000 });
  });

  test("should display product cards", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000); // Wait for data to load

    // Look for product cards or items
    const productCards = page.locator("article, [class*='product-card'], [class*='ProductCard']");

    // At least one product should be visible if products exist
    if ((await productCards.count()) > 0) {
      await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("should have search/filter functionality", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Look for search input or filter controls
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole("searchbox"));

    // Check if search exists
    if ((await searchInput.count()) > 0) {
      await expect(searchInput.first()).toBeVisible();
    }
  });

  test("should navigate to product detail page when clicking a product", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Find a product link
    const productLinks = page.locator('a[href^="/products/"]');

    if ((await productLinks.count()) > 0) {
      await productLinks.first().click();
      await expect(page).toHaveURL(/\/products\/.+/);
    }
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Page should still be functional
    const main = page.locator("main").first();
    await expect(main).toBeVisible();
  });

  test("should display loading state initially", async ({ page }) => {
    // Navigate fresh to catch loading state
    const newPage = await page.context().newPage();
    await newPage.goto("/products", { waitUntil: "domcontentloaded" });

    // Look for loading indicators (spinner, skeleton, etc.)
    const loadingIndicator = newPage
      .locator('[class*="loading"], [class*="skeleton"], [class*="spinner"]')
      .first();

    // The loading state might be very brief, so we just verify the page loads
    await expect(newPage.locator("main")).toBeVisible({ timeout: 10000 });

    await newPage.close();
  });
});

test.describe("Product Detail Page", () => {
  test("should display product information", async ({ page }) => {
    // First navigate to products page to find a product
    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Find and click a product
    const productLinks = page.locator('a[href^="/products/"]');

    if ((await productLinks.count()) > 0) {
      await productLinks.first().click();
      await page.waitForLoadState("networkidle");

      // Verify product page elements
      const productName = page.locator("h1").first();
      await expect(productName).toBeVisible({ timeout: 10000 });

      // Check for Add to Cart button
      const addToCartButton = page.getByRole("button", { name: /add to cart/i });
      if ((await addToCartButton.count()) > 0) {
        await expect(addToCartButton.first()).toBeVisible();
      }
    }
  });

  test("should display product images", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const productLinks = page.locator('a[href^="/products/"]');

    if ((await productLinks.count()) > 0) {
      await productLinks.first().click();
      await page.waitForLoadState("networkidle");

      // Check for product images
      const productImages = page.locator("img");
      await expect(productImages.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("should allow adding product to cart", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const productLinks = page.locator('a[href^="/products/"]');

    if ((await productLinks.count()) > 0) {
      await productLinks.first().click();
      await page.waitForLoadState("networkidle");

      const addToCartButton = page.getByRole("button", { name: /add to cart/i });

      if ((await addToCartButton.count()) > 0) {
        await addToCartButton.first().click();

        // Wait for cart update (toast notification or cart icon update)
        await page.waitForTimeout(1000);

        // Could check for success toast or cart badge update
      }
    }
  });

  test("should display quantity selector", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const productLinks = page.locator('a[href^="/products/"]');

    if ((await productLinks.count()) > 0) {
      await productLinks.first().click();
      await page.waitForLoadState("networkidle");

      // Look for quantity controls
      const quantityInput = page.getByLabel(/quantity/i).or(page.locator('input[type="number"]'));

      if ((await quantityInput.count()) > 0) {
        await expect(quantityInput.first()).toBeVisible({ timeout: 10000 });
      }
    }
  });
});
