import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Sample restaurant catalog — swap this out (and the Business row below) to
// re-skin the demo for a real prospect. Nothing else in the app needs to change.
//
// Currently skinned for: Leaf Veg Restaurant, Tiruvannamalai (live prospect
// demo — leafhotel.in). Pure veg, South Indian / North Indian / Continental,
// matching their own site's described cuisine mix.
async function main() {
  await prisma.business.deleteMany();
  await prisma.business.create({
    data: {
      name: "Leaf Veg Restaurant",
      tagline: "Pure vegetarian multi-cuisine dining — South Indian, North Indian & Continental",
      logoText: "LV",
      colorPrimary: "#2E7D32",
      colorAccent: "#D4A017",
      currencySymbol: "₹",
      phoneDisplay: "+91 93639 44474",
    },
  });

  await prisma.catalogItem.deleteMany();
  await prisma.catalogItem.createMany({
    data: [
      { category: "Breakfast", name: "Masala Dosa", description: "Crispy rice & lentil crepe, spiced potato filling, served with sambar and chutney.", price: 70, sortOrder: 1 },
      { category: "Breakfast", name: "Idli Sambar", description: "Steamed rice cakes with lentil sambar and coconut chutney.", price: 60, sortOrder: 2 },
      { category: "Continental", name: "Veg Grilled Sandwich", description: "Toasted sandwich, mixed vegetables, cheese, herb butter.", price: 120, sortOrder: 1 },
      { category: "Continental", name: "Paneer Tikka Pizza", description: "Wood-fired pizza, tandoori paneer, bell peppers, onion.", price: 220, sortOrder: 2 },
      { category: "Desserts", name: "Gulab Jamun", description: "Warm milk-solid dumplings in rose-cardamom syrup, 2 pieces.", price: 60, sortOrder: 1 },
      { category: "Desserts", name: "Fruit Custard", description: "Chilled seasonal fruits in vanilla custard.", price: 70, sortOrder: 2 },
      { category: "North Indian", name: "Paneer Butter Masala", description: "Cottage cheese in a creamy tomato-butter gravy, mild spice.", price: 180, sortOrder: 1 },
      { category: "North Indian", name: "Dal Makhani", description: "Slow-cooked black lentils, butter and cream, finished overnight.", price: 150, sortOrder: 2 },
      { category: "South Indian", name: "Sambar Rice", description: "Steamed rice tossed with lentil sambar, ghee and papad.", price: 90, sortOrder: 1 },
      { category: "South Indian", name: "Curd Rice", description: "Tempered yogurt rice with mustard seeds, curry leaves and pomegranate.", price: 80, sortOrder: 2 },
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
