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
// Helper: get Unsplash images based on category with real working photo IDs
function getUnsplashImages(category: string, productIndex: number, count = 2): string[] {
  const images: string[] = [];

  // Real Unsplash photo IDs mapped by category - these are verified working URLs
  const categoryPhotoIds: Record<string, string[]> = {
    // Fashion & Clothing
    Dresses: [
      "1539533018865-21b91283b553",
      "1595777457583-95e059d581b8",
      "1515372039744-b8f02a3ae446",
    ],
    Tops: [
      "1618932260643-eee4a2f652a6",
      "1434389677669-e08b4cac3105",
      "1485968579580-b6d095142e6e",
    ],
    Pants: [
      "1624378439575-d88b830d70ad",
      "1473691955023-da1c49c95c78",
      "1506629082955-511b1aa562c8",
    ],
    Skirts: [
      "1583496661160-fb5886a0aaaa",
      "1583496661160-fb5886a0aaaa",
      "1485968579580-b6d095142e6e",
    ],

    // Shoes
    Shoes: ["1460353581641-37baddab0fa2", "1549298916-b41d501d3772", "1543163521-1bd2c6935523"],

    // Beauty
    Makeup: [
      "1512496015851-a90fb38ba796",
      "1522335789203-aabd1fc54bc9",
      "1596462502278-27bfdc403348",
    ],
    Skincare: [
      "1570194065650-d99fb4b14169",
      "1556228578-0d85b1a4d571",
      "1608248597279-f99d160bfcbc",
    ],
    Haircare: [
      "1522338140262-f46f5913618f",
      "1527799820374-dcf8d9d4a388",
      "1519699047591-1f1c6a64c2ac",
    ],
    Perfumes: [
      "1541643600914-78b084683601",
      "1588405748880-12d1d2a59926",
      "1595425970377-c9703cf48b6d",
    ],

    // Accessories
    Watches: [
      "1523275335684-37898b6baf30",
      "1524805444758-089113d48a6d",
      "1508685096489-7aacd43bd3b1",
    ],
    Scarves: [
      "1591047643423-2dc2b4e31869",
      "1610652520814-8a4e5cb9c8e3",
      "1457545195570-67f207084966",
    ],
    Sunglasses: [
      "1511499767150-a48a237f0083",
      "1473496169904-658ba7c44d8a",
      "1506634572416-48cdfe530110",
    ],
    Belts: ["1624222247344-550fb60583c2", "1553062407-98eeb64c6309", "1594223274512-fc4a0b2e86f7"],

    // Bags
    Bags: ["1590874103328-eac38a683ce7", "1548036328-c9fa89d128fa", "1564422179731-5f20e0a6f3a2"],

    // Sportswear
    Sportswear: [
      "1556906781-9a412961c28c",
      "1515886657613-9d3515b1e089",
      "1618354691373-d851c5c3a990",
    ],
  };

  // Get photo IDs for this category, or use fashion as fallback
  const photoIds = categoryPhotoIds[category] ||
    categoryPhotoIds["Dresses"] || [
      "1523275335684-37898b6baf30",
      "1515372039744-b8f02a3ae446",
      "1595777457583-95e059d581b8",
    ];

  for (let k = 0; k < count; k++) {
    // Cycle through available photos for this category
    const photoIndex = (productIndex + k) % photoIds.length;
    const photoId = photoIds[photoIndex];

    // Use exact Unsplash format: https://images.unsplash.com/photo-{id}?w=800
    images.push(`https://images.unsplash.com/photo-${photoId}?w=800`);
  }

  return images;
}

function buildProducts(categories: CategorySeed[]): ProductSeed[] {
  const products: ProductSeed[] = [];
  const productNames = [
    "Elegant",
    "Classic",
    "Modern",
    "Vintage",
    "Luxury",
    "Premium",
    "Stylish",
    "Chic",
    "Designer",
    "Trendy",
    "Essential",
    "Signature",
    "Deluxe",
    "Elite",
    "Exclusive",
    "Royal",
    "Ultimate",
    "Perfect",
    "Beautiful",
    "Gorgeous",
    "Stunning",
    "Amazing",
    "Fabulous",
    "Wonderful",
    "Sophisticated",
    "Refined",
    "Exquisite",
    "Graceful",
    "Radiant",
    "Timeless",
  ];

  // Generate exactly 30 products distributed across all categories
  for (let i = 0; i < 30; i++) {
    const cat = faker.helpers.arrayElement(categories.filter((c) => c.parentId !== null));
    const productAdjective = faker.helpers.arrayElement(productNames);
    const productType = faker.commerce.productName().split(" ").pop(); // Get last word as product type

    const id = `prod_${i + 1}`;
    const basePrice = Number(faker.commerce.price({ min: 25, max: 350 }));
    const price = basePrice;

    products.push({
      id,
      name: `${productAdjective} ${productType}`,
      slug: `${id}-${faker.string.alpha(6).toLowerCase()}`,
      description: faker.commerce.productDescription(),
      shortDesc: faker.commerce.productAdjective(),
      price,
      basePrice,
      sku: `SKU-${faker.string.numeric(8)}`,
      categoryId: cat.id,
      images: getUnsplashImages(cat.name, i, 2),
    });
  }

  return products;
}

// --------------------- USERS ---------------------
function buildUsers(): UserSeed[] {
  return Array.from({ length: 5 }, (_, i) => ({
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
