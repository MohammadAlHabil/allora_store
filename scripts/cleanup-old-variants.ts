import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const oldVariantIds = ["var_14_50ml", "var_14_100ml", "var_15_50ml", "var_15_100ml"];

  console.log("Cleaning up old variants:", oldVariantIds);

  const result = await prisma.productVariant.deleteMany({
    where: {
      id: {
        in: oldVariantIds,
      },
    },
  });

  console.log(`Deleted ${result.count} old variants.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
