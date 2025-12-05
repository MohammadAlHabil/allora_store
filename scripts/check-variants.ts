import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      slug: {
        in: ["makeup-kit", "hair-serum"],
      },
    },
    include: {
      variants: true,
    },
  });

  console.log("Checking variants for specific products:");
  for (const product of products) {
    console.log(`Product: ${product.name} (${product.slug})`);
    for (const variant of product.variants) {
      console.log(`  Variant ID: ${variant.id}`);
      console.log(`  Options: ${JSON.stringify(variant.optionValues)}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
