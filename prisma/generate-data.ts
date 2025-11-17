/* prisma/generate-seed.ts */

import fs from "fs";
import path from "path";
import { faker } from "@faker-js/faker";

// ---- Local lightweight types (do NOT import Prisma runtime types here) ----
type CategorySource = {
  id: string;
  name: string;
  slug: string;
  image: string;
  subcategories: string[];
};

type CategorySeed = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  parentId?: string | null;
};

type ProductSeed = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDesc?: string;
  price: number;
  basePrice: number;
  sku: string;
  categoryId: string;
  images?: string[];
};

type UserSeed = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
};

type AddressSeed = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  line1: string;
  city: string;
  region?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
};

type CouponSeed = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  value: number;
  minOrderAmount?: number;
  isActive?: boolean;
};

type ReviewSeed = {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  body?: string;
};

// --------------------- CATEGORY SOURCE ---------------------
const CATEGORIES: CategorySource[] = [
  {
    id: "cat_fashion",
    name: "Fashion",
    slug: "fashion",
    image: "/images/cat-fashion.jpg",
    subcategories: ["Dresses", "Tops", "Pants", "Skirts"],
  },
  {
    id: "cat_shoes",
    name: "Shoes",
    slug: "shoes",
    image: "/images/cat-shoes.jpg",
    subcategories: [],
  },
  {
    id: "cat_beauty",
    name: "Beauty",
    slug: "beauty",
    image: "/images/cat-beauty.jpg",
    subcategories: ["Makeup", "Skincare", "Haircare", "Perfumes"],
  },
  {
    id: "cat_accessories",
    name: "Accessories",
    slug: "accessories",
    image: "/images/cat-accessories.jpg",
    subcategories: ["Watches", "Scarves", "Sunglasses", "Belts"],
  },
  {
    id: "cat_bags",
    name: "Bags",
    slug: "bags",
    image: "/images/cat-bags.jpg",
    subcategories: [],
  },
  {
    id: "cat_sports",
    name: "Sportswear",
    slug: "sportswear",
    image: "/images/cat-sportswear.jpg",
    subcategories: [],
  },
];

// --------------------- CATEGORY FLATTENER ---------------------
function buildCategories(): CategorySeed[] {
  const categories: CategorySeed[] = [];

  CATEGORIES.forEach((cat) => {
    // main category
    categories.push({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      description: `${cat.name} collection`,
      parentId: null,
    });

    // subcategories
    cat.subcategories.forEach((sub) => {
      const subSlug = sub.toLowerCase().replace(/\s+/g, "-");

      categories.push({
        id: `${cat.id}_${subSlug}`,
        name: sub,
        slug: subSlug,
        image: cat.image,
        description: `${sub} under ${cat.name}`,
        parentId: cat.id,
      });
    });
  });

  return categories;
}

// --------------------- PRODUCTS ---------------------
// Helper: get an array of product image URLs for a given category.
// Uses faker.image.urlLoremFlickr when available, falling back to picsum.photos.
// function getProductImages(categoryName?: string, count = 2): string[] {
//   const images: string[] = [];

//   for (let k = 0; k < count; k++) {
//     try {
//       // Some categories are multi-word; loremflickr accepts a category string.
//       const cat = categoryName
//         ? categoryName
//         : faker.helpers.arrayElement([ "fashion", "shoes", "beauty", "accessories", "bags", "sportswear",
//     "dresses", "tops", "pants", "skirts",
//     "makeup", "skincare", "haircare", "perfumes",
//     "watches", "scarves", "sunglasses", "belts"]);
//       // faker.image.urlLoremFlickr returns a URL for an image matching the category
//       images.push(faker.image.urlLoremFlickr({ width: 900, height: 1200, category: cat }));

//     } catch {
//       // Fallback: deterministic picsum seed
//       images.push(
//         `https://picsum.photos/seed/${categoryName ?? faker.string.uuid()}-${k}/900/1200`
//       );
//     }
//   }

//   return images;
// }
// Picsum helper functions
function picsum(category: string, index: number, w = 900, h = 1200) {
  const seed = `${category.toLowerCase().replace(/\s+/g, "-")}-${index}`;
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

function getPicsumImages(category: string, count = 3): string[] {
  const images: string[] = [];
  for (let i = 0; i < count; i++) {
    images.push(picsum(category, i));
  }
  return images;
}

function buildProducts(categories: CategorySeed[]): ProductSeed[] {
  // leaf categories are those with a parentId (subcategories)
  const leafCategories = categories.filter((c) => c.parentId !== null);

  const products: ProductSeed[] = [];

  leafCategories.forEach((cat, i) => {
    for (let j = 0; j < 8; j++) {
      const id = `prod_${i}_${j}`;
      const price = Number(faker.commerce.price({ min: 20, max: 300 }));
      const basePrice = Number(faker.commerce.price({ min: 20, max: 300 }));
      products.push({
        id,
        name: faker.commerce.productName(),
        slug: `${id}-${faker.string.alpha(6).toLowerCase()}`,
        description: faker.commerce.productDescription(),
        shortDesc: faker.commerce.productAdjective(),
        price,
        basePrice,
        sku: `SKU-${faker.string.numeric(6)}`,
        categoryId: cat.id,
        // include two product images (uses faker.image.urlLoremFlickr by category when available)
        // images: getProductImages(cat.name, 2),
        images: getPicsumImages(cat.name, 2),
      });
    }
  });

  return products;
}

// --------------------- USERS ---------------------
function buildUsers(): UserSeed[] {
  return Array.from({ length: 40 }, (_, i) => ({
    id: `user_${i + 1}`,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: i === 0 ? "ADMIN" : "USER",
    isActive: true,
  }));
}

// --------------------- ADDRESSES ---------------------
function buildAddresses(users: UserSeed[]): AddressSeed[] {
  return users.map((user, i) => ({
    id: `addr_${i + 1}`,
    userId: user.id,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    line1: faker.location.streetAddress(),
    city: faker.location.city(),
    region: faker.location.state(),
    postalCode: faker.location.zipCode(),
    country: "USA",
    phone: faker.phone.number(),
    isDefault: i % 3 === 0,
  }));
}

// --------------------- COUPONS ---------------------
function buildCoupons(): CouponSeed[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `coupon_${i + 1}`,
    code: `SAVE${10 + i}`,
    type: i % 3 === 0 ? "PERCENTAGE" : i % 3 === 1 ? "FIXED" : "FREE_SHIPPING",
    value: 5 + i,
    minOrderAmount: 20,
    isActive: true,
  }));
}

// --------------------- REVIEWS ---------------------
function buildReviews(users: UserSeed[], products: ProductSeed[]): ReviewSeed[] {
  return Array.from({ length: 50 }, (_, i) => ({
    id: `review_${i + 1}`,
    userId: faker.helpers.arrayElement(users).id,
    productId: faker.helpers.arrayElement(products).id,
    rating: faker.number.int({ min: 1, max: 5 }),
    title: faker.commerce.productAdjective(),
    body: faker.commerce.productDescription(),
  }));
}

// --------------------- GENERATE FINAL DATA ---------------------
function generateData() {
  const categories = buildCategories();
  const users = buildUsers();
  const addresses = buildAddresses(users);
  const products = buildProducts(categories);
  const coupons = buildCoupons();
  const reviews = buildReviews(users, products);

  return {
    categories,
    users,
    addresses,
    products,
    coupons,
    reviews,
  };
}

// --------------------- EXPORT JSON ---------------------
async function exportData() {
  const data = generateData();

  const outputPath = path.join(process.cwd(), "prisma", "seed-data.json");
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

  console.log("✔ Seed data generated successfully!");
  console.log(`📁 Saved to: ${outputPath}`);
  console.log(`  - categories: ${data.categories.length}`);
  console.log(`  - users: ${data.users.length}`);
  console.log(`  - addresses: ${data.addresses.length}`);
  console.log(`  - products: ${data.products.length}`);
  console.log(`  - coupons: ${data.coupons.length}`);
  console.log(`  - reviews: ${data.reviews.length}`);
}

exportData().catch((err) => {
  console.error("❌ Failed to generate seed data:", err);
  process.exit(1);
});
