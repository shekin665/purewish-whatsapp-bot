import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Sample restaurant catalog — swap this out (and the Business row below) to
// re-skin the demo for a real prospect. Nothing else in the app needs to change.
async function main() {
  await prisma.business.deleteMany();
  await prisma.business.create({
    data: {
      name: "Bella Vista Trattoria",
      tagline: "Family-run Italian kitchen since 1998",
      logoText: "BV",
      colorPrimary: "#C0392B",
      colorAccent: "#2C3E50",
      currencySymbol: "$",
      phoneDisplay: "+1 (555) 019-2834",
    },
  });

  await prisma.catalogItem.deleteMany();
  await prisma.catalogItem.createMany({
    data: [
      { category: "Starters", name: "Garlic Bread", description: "Toasted ciabatta, roasted garlic butter, parsley.", price: 6.5, sortOrder: 1 },
      { category: "Starters", name: "Bruschetta", description: "Grilled bread, vine tomatoes, basil, olive oil.", price: 7.5, sortOrder: 2 },
      { category: "Pizza", name: "Margherita", description: "San Marzano tomato, fresh mozzarella, basil.", price: 14, sortOrder: 1 },
      { category: "Pizza", name: "Pepperoni", description: "Tomato, mozzarella, spicy pepperoni.", price: 16, sortOrder: 2 },
      { category: "Pasta", name: "Spaghetti Carbonara", description: "Guanciale, egg, pecorino, black pepper.", price: 15.5, sortOrder: 1 },
      { category: "Pasta", name: "Lasagna", description: "Layered pasta, slow-cooked ragu, béchamel.", price: 16.5, sortOrder: 2 },
      { category: "Dessert", name: "Tiramisu", description: "Espresso-soaked ladyfingers, mascarpone cream.", price: 7, sortOrder: 1 },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
