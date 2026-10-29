import { prisma } from "@/lib/prisma";
import { getBusiness } from "@/lib/business";
import type { CatalogItemLite } from "./fsm";

// Every Prisma call this feature needs lives here — the fsm never imports
// Prisma directly, and the orchestrator never writes raw queries inline.

export async function getActiveEnquiry(phone: string) {
  const existing = await prisma.enquiry.findFirst({
    where: { phone, state: { not: "COMPLETED" } },
    orderBy: { updatedAt: "desc" },
  });
  return existing ?? prisma.enquiry.create({ data: { phone, state: "GREETING" } });
}

export async function updateEnquiry(id: string, patch: Record<string, unknown>) {
  return prisma.enquiry.update({ where: { id }, data: patch });
}

export async function logMessage(enquiryId: string, direction: "INBOUND" | "OUTBOUND", body: string) {
  return prisma.enquiryMessage.create({ data: { enquiryId, direction, body } });
}

export async function getAvailableCategories(): Promise<string[]> {
  const items = await prisma.catalogItem.findMany({
    where: { active: true },
    distinct: ["category"],
    orderBy: [{ sortOrder: "asc" }, { category: "asc" }],
    select: { category: true },
  });
  return items.map((i) => i.category);
}

export async function getItemsForCategory(category: string): Promise<CatalogItemLite[]> {
  const items = await prisma.catalogItem.findMany({
    where: { category, active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return items.map(toLite);
}

export async function getItemById(id: string): Promise<CatalogItemLite | null> {
  const item = await prisma.catalogItem.findUnique({ where: { id } });
  return item ? toLite(item) : null;
}

export async function getBusinessName(): Promise<string> {
  return (await getBusiness()).name;
}

export async function getCurrencySymbol(): Promise<string> {
  return (await getBusiness()).currencySymbol;
}

export async function getEnquiryWithItem(enquiryId: string) {
  return prisma.enquiry.findUnique({
    where: { id: enquiryId },
    include: { matchedItem: true },
  });
}

function toLite(item: {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
}): CatalogItemLite {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    description: item.description ?? undefined,
  };
}
