/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import { PrismaClient } from "../app/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const dataDir = path.join(__dirname, "data");

function readArray(file: string) {
  try {
    const p = path.join(dataDir, file);
    if (!fs.existsSync(p)) return [];
    const raw = fs.readFileSync(p, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err: any) {
    console.warn("Failed to read", file, err?.message || err);
    return [];
  }
}

function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .replace(/['"–—]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

function mapOrderStatus(input?: any) {
  if (!input && input !== 0) return undefined;
  const s = String(input).toUpperCase();
  // map old value "PENDING" to new enum name "PENDING_PAYMENT"
  if (s === "PENDING") return "PENDING_PAYMENT";
  const allowed = new Set([
    "DRAFT",
    "PENDING_PAYMENT",
    "PAID",
    "CANCELLED",
    "EXPIRED",
    "FULFILLED",
    "PARTIALLY_FULFILLED",
    "REFUNDED",
  ]);
  return allowed.has(s) ? s : undefined;
}

async function main() {
  console.log("prisma/seed.ts — starting");

  const seedFile = path.join(__dirname, "seed-data.json");
  let data: any = {};

  if (fs.existsSync(seedFile)) {
    try {
      data = JSON.parse(fs.readFileSync(seedFile, "utf-8"));
    } catch {
      console.warn("Failed to parse seed-data.json, falling back to per-file read");
    }
  }

  if (!data || Object.keys(data).length === 0) {
    // fallback: read each file from prisma/data
    const keys = [
      "categories",
      "warehouses",
      "products",
      "productImages",
      "productVariants",
      "productCategories",
      "users",
      "accounts",
      "sessions",
      "verificationTokens",
      "inventories",
      "shippingMethods",
      "coupons",
      "addresses",
      "carts",
      "cartItems",
      "orders",
      "orderItems",
      "payments",
      "reviews",
      "wishlistItems",
      "activityLogs",
    ];
    for (const k of keys) data[k] = readArray(`${k}.json`);
  }

  try {
    // Categories
    if (Array.isArray(data.categories)) {
      for (const c of data.categories) {
        const slug = c.slug ?? slugify(c.name);
        await prisma.category.upsert({
          where: { id: c.id },
          update: {
            name: c.name,
            slug,
            description: c.description ?? undefined,
            parentId: c.parentId ?? null,
            isActive: c.isActive ?? true,
          },
          create: {
            id: c.id,
            name: c.name,
            slug,
            description: c.description ?? undefined,
            parentId: c.parentId ?? null,
          },
        });
      }
      console.log(`Seeded ${data.categories.length} categories`);
    }

    // Warehouses
    if (Array.isArray(data.warehouses) && data.warehouses.length) {
      await prisma.warehouse.createMany({ data: data.warehouses, skipDuplicates: true });
      console.log(`Seeded ${data.warehouses.length} warehouses`);
    }

    // Products
    if (Array.isArray(data.products)) {
      for (const p of data.products) {
        const slug = p.slug ?? slugify(p.name);
        const sku = p.sku ?? undefined;
        const createData: any = {
          id: p.id,
          name: p.name,
          slug,
          sku: sku ?? undefined,
          description: p.description ?? undefined,
          shortDesc: p.shortDesc ?? undefined,
          basePrice: String(p.basePrice ?? p.price ?? 0),
          currency: p.currency ?? "USD",
        };

        if (p.id) {
          await prisma.product.upsert({
            where: { id: p.id },
            update: createData,
            create: createData,
          });
        } else if (sku) {
          await prisma.product.upsert({ where: { sku }, update: createData, create: createData });
        } else {
          await prisma.product.upsert({ where: { slug }, update: createData, create: createData });
        }

        const product = p.id
          ? await prisma.product.findUnique({ where: { id: p.id } })
          : sku
            ? await prisma.product.findUnique({ where: { sku } })
            : await prisma.product.findUnique({ where: { slug } });
        if (product) {
          if (p.categoryId) {
            const exists = await prisma.productCategory.findFirst({
              where: { productId: product.id, categoryId: p.categoryId },
            });
            if (!exists)
              await prisma.productCategory.create({
                data: { productId: product.id, categoryId: p.categoryId },
              });
          }
          if (Array.isArray(p.images) && p.images.length) {
            const existing = await prisma.productImage.findFirst({
              where: { productId: product.id },
            });
            if (!existing) {
              for (let i = 0; i < p.images.length; i++) {
                await prisma.productImage.create({
                  data: {
                    productId: product.id,
                    url: p.images[i],
                    alt: p.name ?? undefined,
                    width: 800,
                    height: 800,
                    sortOrder: i,
                  },
                });
              }
            }
          }
        }
      }
      console.log(`Seeded ${data.products.length} products`);
    }

    // Product variants
    if (Array.isArray(data.productVariants) && data.productVariants.length) {
      await prisma.productVariant.createMany({
        data: data.productVariants.map((v: any) => ({
          ...v,
          price: v.price ? String(v.price) : undefined,
        })),
        skipDuplicates: true,
      });
      console.log(`Seeded ${data.productVariants.length} product variants`);
    }

    // Inventories - upsert to handle variant uniqueness
    if (Array.isArray(data.inventories) && data.inventories.length) {
      let seededCount = 0;
      for (const inv of data.inventories) {
        try {
          // Skip inventories that reference non-existent products
          if (inv.productId && inv.productId.startsWith("prod_digital")) {
            console.warn(
              `Skipping inventory ${inv.id} - references non-existent product ${inv.productId}`
            );
            continue;
          }
          await prisma.inventory.upsert({ where: { id: inv.id }, update: inv, create: inv });
          seededCount++;
        } catch (e: any) {
          console.warn("inventory upsert failed for", inv.id, e?.message || e);
        }
      }
      console.log(
        `Seeded ${seededCount} inventories (skipped ${data.inventories.length - seededCount})`
      );
    }

    // Shipping methods
    if (Array.isArray(data.shippingMethods) && data.shippingMethods.length) {
      for (const m of data.shippingMethods) {
        try {
          const upsertData: any = {
            ...m,
            basePrice: m.basePrice != null ? String(m.basePrice) : undefined,
          };
          await prisma.shippingMethod.upsert({
            where: { key: m.key },
            update: upsertData,
            create: upsertData,
          });
        } catch (e: any) {
          console.warn("shippingMethod upsert failed for", m.key, e?.message || e);
        }
      }
      console.log(`Seeded ${data.shippingMethods.length} shipping methods`);
    }

    // Users (hash passwords before inserting/updating) - MUST come before Accounts - MUST come before Accounts
    if (Array.isArray(data.users)) {
      for (const u of data.users) {
        // clone to avoid mutating original data
        const userPayload: any = { ...u };

        // If a plaintext password is provided, hash it. Avoid double-hashing
        // by checking for bcrypt hash prefix ($2a$ / $2b$ / $2y$).
        if (typeof userPayload.password === "string" && userPayload.password.length) {
          const pw: string = userPayload.password;
          if (!pw.startsWith("$2a$") && !pw.startsWith("$2b$") && !pw.startsWith("$2y$")) {
            userPayload.password = bcrypt.hashSync(pw, 12);
          }
        }

        // remove any ephemeral fields that shouldn't be stored
        if (userPayload.plainPassword) delete userPayload.plainPassword;

        if (userPayload.email) {
          await prisma.user.upsert({
            where: { email: userPayload.email },
            update: userPayload,
            create: userPayload,
          });
        } else if (userPayload.id) {
          await prisma.user.upsert({
            where: { id: userPayload.id },
            update: userPayload,
            create: userPayload,
          });
        } else {
          await prisma.user.create({ data: userPayload });
        }
      }
      console.log(`Seeded ${data.users.length} users`);
    }

    // Accounts / Sessions / VerificationTokens (after Users)
    if (Array.isArray(data.accounts) && data.accounts.length)
      await prisma.account.createMany({ data: data.accounts, skipDuplicates: true });
    if (Array.isArray(data.sessions) && data.sessions.length)
      await prisma.session.createMany({ data: data.sessions, skipDuplicates: true });
    if (Array.isArray(data.verificationTokens) && data.verificationTokens.length)
      await prisma.verificationToken.createMany({
        data: data.verificationTokens,
        skipDuplicates: true,
      });

    // Coupons
    if (Array.isArray(data.coupons)) {
      for (const c of data.coupons) {
        await prisma.coupon.upsert({
          where: { id: c.id },
          update: { ...c, value: String(c.value) },
          create: { ...c, value: String(c.value) },
        });
      }
      console.log(`Seeded ${data.coupons.length} coupons`);
    }

    // Addresses
    if (Array.isArray(data.addresses)) {
      for (const a of data.addresses) {
        const postalCode = a.postalCode ?? "00000";
        const country = a.country ?? "US";
        await prisma.address.upsert({
          where: { id: a.id },
          update: { ...a, postalCode, country },
          create: { ...a, postalCode, country },
        });
      }
      console.log(`Seeded ${data.addresses.length} addresses`);
    }

    // Carts
    if (Array.isArray(data.carts)) {
      for (const c of data.carts) {
        await prisma.cart.upsert({ where: { id: c.id }, update: { ...c }, create: c });
      }
      console.log(`Seeded ${data.carts.length} carts`);
    }

    // Cart items
    if (Array.isArray(data.cartItems)) {
      for (const ci of data.cartItems) {
        await prisma.cartItem.upsert({
          where: { id: ci.id },
          update: { ...ci },
          create: {
            ...ci,
            unitPrice: String(ci.unitPrice ?? 0),
            totalPrice: String(ci.totalPrice ?? 0),
          },
        });
      }
      console.log(`Seeded ${data.cartItems.length} cart items`);
    }

    // Orders (normalize enum values to match current Prisma schema)
    if (Array.isArray(data.orders)) {
      for (const o of data.orders) {
        const updateData: any = {
          ...o,
          subtotal: String(o.subtotal ?? 0),
          total: String(o.total ?? 0),
        };
        const createData: any = {
          ...o,
          subtotal: String(o.subtotal ?? 0),
          total: String(o.total ?? 0),
        };

        const mappedStatus = mapOrderStatus(o.status);
        if (mappedStatus) {
          updateData.status = mappedStatus;
          createData.status = mappedStatus;
        } else {
          // remove invalid status to let DB default apply
          delete updateData.status;
          delete createData.status;
        }

        // ensure paymentStatus and shippingStatus are strings (they usually match enums)
        if (o.paymentStatus) updateData.paymentStatus = String(o.paymentStatus);
        if (o.paymentStatus) createData.paymentStatus = String(o.paymentStatus);
        if (o.shippingStatus) updateData.shippingStatus = String(o.shippingStatus);
        if (o.shippingStatus) createData.shippingStatus = String(o.shippingStatus);

        await prisma.order.upsert({ where: { id: o.id }, update: updateData, create: createData });
      }
      console.log(`Seeded ${data.orders.length} orders`);
    }

    // Order items
    if (Array.isArray(data.orderItems)) {
      for (const oi of data.orderItems) {
        await prisma.orderItem.upsert({
          where: { id: oi.id },
          update: {
            ...oi,
            unitPrice: String(oi.unitPrice ?? 0),
            totalPrice: String(oi.totalPrice ?? 0),
          },
          create: {
            ...oi,
            unitPrice: String(oi.unitPrice ?? 0),
            totalPrice: String(oi.totalPrice ?? 0),
          },
        });
      }
      console.log(`Seeded ${data.orderItems.length} order items`);
    }

    // Payments
    if (Array.isArray(data.payments)) {
      for (const p of data.payments) {
        await prisma.payment.upsert({
          where: { id: p.id },
          update: { ...p, amount: String(p.amount ?? 0) },
          create: { ...p, amount: String(p.amount ?? 0) },
        });
      }
      console.log(`Seeded ${data.payments.length} payments`);
    }

    // Reviews
    if (Array.isArray(data.reviews)) {
      for (const r of data.reviews) {
        const user = await prisma.user.findUnique({ where: { id: r.userId } });
        const product = await prisma.product.findUnique({ where: { id: r.productId } });
        if (!user || !product) continue;
        await prisma.review.upsert({ where: { id: r.id }, update: { ...r }, create: r });
      }
      console.log(`Seeded ${data.reviews.length} reviews`);
    }

    // Wishlist
    if (Array.isArray(data.wishlistItems)) {
      for (const wi of data.wishlistItems) {
        await prisma.wishlistItem.upsert({ where: { id: wi.id }, update: { ...wi }, create: wi });
      }
      console.log(`Seeded ${data.wishlistItems.length} wishlist items`);
    }

    // Activity logs
    if (Array.isArray(data.activityLogs)) {
      for (const a of data.activityLogs) {
        await prisma.activityLog.upsert({ where: { id: a.id }, update: { ...a }, create: a });
      }
      console.log(`Seeded ${data.activityLogs.length} activity logs`);
    }

    console.log("✅ Seed run finished");
  } catch (err: any) {
    console.error("Seeding failed:", err?.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
