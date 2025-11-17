import fs from "fs";
import path from "path";
import prisma from "@/shared/lib/prisma";

function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .replace(/["'''""–—]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

async function main() {
  // const filePath = path.join(process.cwd(), "prisma", "seed-data.json");
  const filePath = path.join(__dirname, "seed-data.json");

  if (!fs.existsSync(filePath)) {
    console.error(`Seed file not found: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

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
            isActive: true,
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

    // Users
    if (Array.isArray(data.users)) {
      for (const u of data.users) {
        await prisma.user.upsert({
          where: { email: u.email },
          update: {
            name: u.name ?? undefined,
            role: u.role ?? undefined,
            isActive: u.isActive ?? true,
          },
          create: {
            id: u.id,
            name: u.name ?? undefined,
            email: u.email,
            role: u.role ?? undefined,
            isActive: u.isActive ?? true,
          },
        });
      }
      console.log(`Seeded ${data.users.length} users`);
    }

    // Products
    if (Array.isArray(data.products)) {
      for (const p of data.products) {
        const slug = p.slug ?? slugify(p.name);
        const sku = p.sku ?? undefined;

        // upsert by sku if present, otherwise by slug
        const createData = {
          id: p.id,
          name: p.name,
          slug,
          sku: sku ?? undefined,
          description: p.description ?? undefined,
          shortDesc: p.shortDesc ?? undefined,
          basePrice: String(p.basePrice ?? p.price ?? 0),
          currency: p.currency ?? "USD",
        };

        if (sku) {
          await prisma.product.upsert({
            where: { sku },
            update: {
              name: p.name,
              description: p.description ?? undefined,
              shortDesc: p.shortDesc ?? undefined,
              basePrice: String(p.basePrice ?? p.price ?? 0),
            },
            create: createData,
          });
        } else {
          await prisma.product.upsert({
            where: { slug },
            update: {
              name: p.name,
              description: p.description ?? undefined,
              shortDesc: p.shortDesc ?? undefined,
              basePrice: String(p.basePrice ?? p.price ?? 0),
            },
            create: createData,
          });
        }

        // link to category using categoryId
        if (p.categoryId) {
          const product = await prisma.product.findFirst({ where: sku ? { sku } : { slug } });
          if (product) {
            const exists = await prisma.productCategory.findFirst({
              where: { productId: product.id, categoryId: p.categoryId },
            });
            if (!exists) {
              await prisma.productCategory.create({
                data: { productId: product.id, categoryId: p.categoryId },
              });
            }
            // create product images if provided and not already present
            if (Array.isArray(p.images) && p.images.length > 0) {
              const firstImage = await prisma.productImage.findFirst({
                where: { productId: product.id },
              });
              if (!firstImage) {
                for (let idx = 0; idx < p.images.length; idx++) {
                  const img = p.images[idx];
                  await prisma.productImage.create({
                    data: {
                      productId: product.id,
                      url: img,
                      alt: p.name ?? undefined,
                      width: 800,
                      height: 800,
                      sortOrder: idx,
                    },
                  });
                }
              }
            }
          }
        }
      }
      console.log(`Seeded ${data.products.length} products`);
    }

    // Addresses
    if (Array.isArray(data.addresses)) {
      for (const a of data.addresses) {
        // Address model requires postalCode and country; provide defaults if missing
        const postalCode = a.postalCode ?? "00000";
        const country = a.country ?? "US";
        await prisma.address.upsert({
          where: { id: a.id },
          update: {
            firstName: a.firstName ?? undefined,
            lastName: a.lastName ?? undefined,
            line1: a.line1,
            city: a.city ?? "",
            postalCode,
            country,
            isDefault: a.isDefault ?? false,
            userId: a.userId ?? undefined,
          },
          create: {
            id: a.id,
            userId: a.userId ?? undefined,
            firstName: a.firstName ?? undefined,
            lastName: a.lastName ?? undefined,
            line1: a.line1,
            city: a.city ?? "",
            postalCode,
            country,
            phone: a.phone ?? undefined,
            isDefault: a.isDefault ?? false,
          },
        });
      }
      console.log(`Seeded ${data.addresses.length} addresses`);
    }

    // Coupons
    if (Array.isArray(data.coupons)) {
      for (const c of data.coupons) {
        await prisma.coupon.upsert({
          where: { id: c.id },
          update: {
            code: c.code,
            type: c.type,
            value: String(c.value),
            minOrderAmount: c.minOrderAmount ?? 0,
            isActive: c.isActive ?? true,
          },
          create: {
            id: c.id,
            code: c.code,
            type: c.type,
            value: String(c.value),
            minOrderAmount: c.minOrderAmount ?? 0,
            isActive: c.isActive ?? true,
          },
        });
      }
      console.log(`Seeded ${data.coupons.length} coupons`);
    }

    // Reviews
    if (Array.isArray(data.reviews)) {
      for (const r of data.reviews) {
        // ensure referenced user and product exist
        const user = await prisma.user.findUnique({ where: { id: r.userId } });
        const product = await prisma.product.findUnique({ where: { id: r.productId } });
        if (!user || !product) continue;

        await prisma.review.upsert({
          where: { id: r.id },
          update: {
            rating: r.rating,
            title: r.title ?? undefined,
            body: r.body ?? undefined,
            approved: true,
          },
          create: {
            id: r.id,
            userId: r.userId,
            productId: r.productId,
            rating: r.rating,
            title: r.title ?? undefined,
            body: r.body ?? undefined,
            approved: true,
          },
        });
      }
      console.log(`Seeded ${data.reviews.length} reviews`);
    }

    console.log("✅ Seeding completed successfully.");
  } catch (err) {
    console.error("Error during seeding:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
