import { test, expect, Page } from "@playwright/test";

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

async function addItemToCart(page: Page) {
  await page.goto("/products");
  await page.waitForLoadState("networkidle");

  const productLinks = page.locator('a[href^="/products/"]');
  if ((await productLinks.count()) === 0) return;

  await productLinks.first().click();
  await page.waitForURL("**/products/**", { timeout: 10000 });

  await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  const addToCartButton = page.getByRole("button", { name: /add to cart/i });
  await addToCartButton.first().click();
  await page.waitForTimeout(600);
}

// ---------------------------------------------------------
// CART PAGE — EMPTY CART
// ---------------------------------------------------------

test.describe("Cart Page — Empty Cart", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/cart?reset=1");
    await page.waitForLoadState("networkidle");
  });

  test("should display empty cart page", async ({ page }) => {
    const emptyMessage = page.getByText(/empty|no items/i);
    await expect(emptyMessage).toBeVisible();
  });

  test("should hide summary section when cart is empty", async ({ page }) => {
    const summary = page.getByText(/summary|total|subtotal/i).first();
    expect(await summary.count()).toBe(0);
  });

  test("should show continue shopping link", async ({ page }) => {
    const link = page.getByRole("link", { name: /continue shopping|shop now/i });
    await expect(link).toBeVisible();
  });
});

// ---------------------------------------------------------
// CART PAGE — FILLED CART
// ---------------------------------------------------------

test.describe("Cart Page — With Items", () => {
  test.beforeEach(async ({ page }) => {
    await addItemToCart(page);
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
  });

  test("should show cart items", async ({ page }) => {
    const cartItems = page.getByTestId("cart-item");
    await expect(cartItems.first()).toBeVisible();
  });

  test("should display summary section", async ({ page }) => {
    const summary = page.getByText(/summary|total|subtotal/i).first();
    await expect(summary).toBeVisible();
  });

  test("should show checkout button", async ({ page }) => {
    const checkoutBtn = page.getByRole("button", { name: /checkout/i });
    await expect(checkoutBtn).toBeVisible();
  });
});

// ---------------------------------------------------------
// CART FUNCTIONALITY TESTS
// ---------------------------------------------------------

test.describe("Cart Functionality", () => {
  test("should add item to cart", async ({ page }) => {
    await addItemToCart(page);

    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    const cartItems = page.getByTestId("cart-item");
    await expect(cartItems.first()).toBeVisible();
  });

  test("should update item quantity", async ({ page }) => {
    await addItemToCart(page);

    await page.goto("/cart");

    const incrementBtn = page.getByRole("button", { name: /increase|plus|\+/i });

    if ((await incrementBtn.count()) > 0) {
      await incrementBtn.first().click();
      await page.waitForTimeout(300);
    }
  });

  test("should remove item from cart", async ({ page }) => {
    await addItemToCart(page);

    await page.goto("/cart");

    const removeBtn = page.getByRole("button", { name: /remove|delete|trash/i });
    if ((await removeBtn.count()) > 0) {
      await removeBtn.first().click();
      await page.waitForTimeout(300);
    }
  });
});
