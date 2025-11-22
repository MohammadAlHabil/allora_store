/* eslint-disable */
const fs = require("fs");
const path = require("path");

const outPath = path.join(__dirname, "seed-data.json");
const dataDir = path.join(__dirname, "data");

function readArray(file) {
  try {
    const p = path.join(dataDir, file);
    if (!fs.existsSync(p)) return [];
    const raw = fs.readFileSync(p, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to read", file, err.message);
    return [];
  }
}

function buildSeed() {
  if (!fs.existsSync(dataDir)) {
    console.error("Data directory not found:", dataDir);
    process.exit(1);
  }

  // Merge order chosen to reduce FK conflicts between models
  const seed = {
    categories: readArray("categories.json"),
    warehouses: readArray("warehouses.json"),
    products: readArray("products.json"),
    productImages: readArray("productImages.json"),
    productVariants: readArray("productVariants.json"),
    productCategories: readArray("productCategories.json"),
    shippingMethods: readArray("shippingMethods.json"),
    users: readArray("users.json"),
    accounts: readArray("accounts.json"),
    sessions: readArray("sessions.json"),
    verificationTokens: readArray("verificationTokens.json"),
    inventories: readArray("inventories.json"),
    coupons: readArray("coupons.json"),
    addresses: readArray("addresses.json"),
    carts: readArray("carts.json"),
    cartItems: readArray("cartItems.json"),
    orders: readArray("orders.json"),
    orderItems: readArray("orderItems.json"),
    payments: readArray("payments.json"),
    reviews: readArray("reviews.json"),
    wishlistItems: readArray("wishlistItems.json"),
    activityLogs: readArray("activityLogs.json"),
  };
  fs.writeFileSync(outPath, JSON.stringify(seed, null, 2));
  console.log("Built seed file:", outPath);
  Object.keys(seed).forEach((k) => {
    const arr = seed[k];
    const count = Array.isArray(arr) ? arr.length : arr ? 1 : 0;
    console.log(`  - ${k}: ${count}`);
  });
}

buildSeed();
