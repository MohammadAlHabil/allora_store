const { PrismaClient } = require("./app/generated/prisma");
const prisma = new PrismaClient();

async function checkInventory() {
  // Get cart items for Elegant Shirt
  const cartItems = await prisma.cartItem.findMany({
    where: {
      title: {
        contains: "Elegant Shirt",
      },
    },
    include: {
      product: true,
      variant: true,
    },
  });

  console.log("🛒 Cart Items:", JSON.stringify(cartItems, null, 2));

  // Check inventory for these items
  for (const item of cartItems) {
    const inventory = await prisma.inventory.findFirst({
      where: {
        productId: item.productId,
        variantId: item.variantId || null,
      },
    });

    console.log(`\n📦 Inventory for ${item.title}:`, {
      productId: item.productId,
      variantId: item.variantId,
      found: !!inventory,
      inventory: inventory
        ? {
            sku: inventory.sku,
            quantity: inventory.quantity,
            reserved: inventory.reserved,
            available: inventory.quantity - inventory.reserved,
          }
        : null,
    });
  }

  await prisma.$disconnect();
}

checkInventory().catch(console.error);
