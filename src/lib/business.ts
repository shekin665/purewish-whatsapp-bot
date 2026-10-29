import { prisma } from "@/lib/prisma";

// Single source of branding truth. Re-skin this demo for a new prospect by
// editing the one Business row (via seed.ts or directly in the DB) — no
// other file needs to change.
const FALLBACK = {
  name: "Your Business",
  tagline: null as string | null,
  logoText: "YB",
  colorPrimary: "#C0392B",
  colorAccent: "#2C3E50",
  currencySymbol: "$",
  phoneDisplay: null as string | null,
};

export async function getBusiness() {
  const business = await prisma.business.findFirst();
  return business ?? FALLBACK;
}
