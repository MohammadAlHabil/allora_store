import prisma from "../shared/lib/prisma";

async function main() {
  const ids = ["cmi6qwjig0012yngvjexbi9f0", "cmi6sv3w60019yngv3mvmkbz6"];

  for (const id of ids) {
    const addr = await prisma.address.findUnique({ where: { id } });
    console.log("---", id, "---");
    if (!addr) {
      console.log("Not found");
    } else {
      console.log({
        id: addr.id,
        country: addr.country,
        city: addr.city,
        line1: addr.line1,
        isDefault: addr.isDefault,
      });
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
