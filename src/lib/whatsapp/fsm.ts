// Pure conversation state machine — no Prisma, no Twilio. All data comes
// through `deps`, supplied by the orchestrator (see engine.ts). This is
// what makes the flow trivially testable and portable to a different
// backend: only the Deps implementation (store.ts) would need to change.

export type CatalogItemLite = {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
};

export type EnquiryState =
  | "GREETING"
  | "AWAITING_CATEGORY"
  | "AWAITING_ITEM_SELECTION"
  | "AWAITING_QUANTITY"
  | "COMPLETED";

export type EnquiryFields = {
  state: string;
  selectedCategory: string | null;
  matchedItemId: string | null;
  quantity: number | null;
};

export type EnquiryPatch = Partial<{
  state: EnquiryState;
  selectedCategory: string | null;
  matchedItemId: string | null;
  quantity: number | null;
  totalPrice: number | null;
  completedAt: Date | null;
}>;

export type Deps = {
  getAvailableCategories: () => Promise<string[]>;
  getItemsForCategory: (category: string) => Promise<CatalogItemLite[]>;
  getItemById: (id: string) => Promise<CatalogItemLite | null>;
  getBusinessName: () => Promise<string>;
  getCurrencySymbol: () => Promise<string>;
};

export type FsmResult = {
  patch: EnquiryPatch;
  replies: string[];
  includeDocumentLink?: boolean;
};

const MAX_QUANTITY = 20;

export async function processMessage(
  enquiry: EnquiryFields,
  rawBody: string,
  deps: Deps
): Promise<FsmResult> {
  const body = rawBody.trim();
  const upper = body.toUpperCase();

  if (upper === "RESTART" || upper === "MENU") return restart(deps);
  if (upper === "HELP") return { patch: {}, replies: await promptFor(enquiry, deps) };

  switch (enquiry.state) {
    case "GREETING":
      return handleGreeting(deps);
    case "AWAITING_CATEGORY":
      return handleAwaitingCategory(body, deps);
    case "AWAITING_ITEM_SELECTION":
      return handleAwaitingItemSelection(enquiry, body, deps);
    case "AWAITING_QUANTITY":
      return handleAwaitingQuantity(enquiry, body, deps);
    case "COMPLETED":
    default:
      // Orchestrator always routes a COMPLETED/unknown enquiry to a fresh
      // row before calling in (see store.getActiveEnquiry), so this is a
      // defensive fallback only.
      return handleGreeting(deps);
  }
}

async function handleGreeting(deps: Deps): Promise<FsmResult> {
  const name = await deps.getBusinessName();
  const categories = await deps.getAvailableCategories();
  return {
    patch: { state: "AWAITING_CATEGORY" },
    replies: [
      `👋 Welcome to ${name}! I can take your order right here on WhatsApp.`,
      renderCategoryMenu(categories),
    ],
  };
}

async function handleAwaitingCategory(body: string, deps: Deps): Promise<FsmResult> {
  const categories = await deps.getAvailableCategories();
  const index = parseMenuIndex(body, categories.length);

  if (index === null) {
    return {
      patch: {},
      replies: ["Sorry, I didn't catch that — please reply with a number.", renderCategoryMenu(categories)],
    };
  }

  const category = categories[index];
  const items = await deps.getItemsForCategory(category);
  const currency = await deps.getCurrencySymbol();
  return {
    patch: { selectedCategory: category, state: "AWAITING_ITEM_SELECTION" },
    replies: [renderItemMenu(category, items, currency)],
  };
}

async function handleAwaitingItemSelection(
  enquiry: EnquiryFields,
  body: string,
  deps: Deps
): Promise<FsmResult> {
  if (!enquiry.selectedCategory) return restart(deps);

  const items = await deps.getItemsForCategory(enquiry.selectedCategory);
  const index = parseMenuIndex(body, items.length);
  const currency = await deps.getCurrencySymbol();

  if (index === null) {
    return {
      patch: {},
      replies: [
        "Sorry, that's not on the menu — please reply with a number.",
        renderItemMenu(enquiry.selectedCategory, items, currency),
      ],
    };
  }

  const item = items[index];
  return {
    patch: { matchedItemId: item.id, state: "AWAITING_QUANTITY" },
    replies: [`Great choice — ${item.name}. How many would you like? (reply with a number, e.g. 1)`],
  };
}

async function handleAwaitingQuantity(
  enquiry: EnquiryFields,
  body: string,
  deps: Deps
): Promise<FsmResult> {
  if (!enquiry.matchedItemId) return restart(deps);

  const n = Number.parseInt(body.trim(), 10);
  if (!Number.isInteger(n) || n < 1 || n > MAX_QUANTITY) {
    return {
      patch: {},
      replies: [`Please reply with a quantity between 1 and ${MAX_QUANTITY}.`],
    };
  }

  const item = await deps.getItemById(enquiry.matchedItemId);
  if (!item) return restart(deps);

  const currency = await deps.getCurrencySymbol();
  const totalPrice = item.price * n;

  return {
    patch: { quantity: n, totalPrice, state: "COMPLETED", completedAt: new Date() },
    replies: [
      `✅ Order confirmed: ${n} × ${item.name} — total ${currency}${totalPrice.toFixed(2)}.`,
      `Your confirmation is on its way as a PDF. Reply RESTART to place another order.`,
    ],
    includeDocumentLink: true,
  };
}

async function restart(deps: Deps): Promise<FsmResult> {
  const greeting = await handleGreeting(deps);
  return { patch: { ...greeting.patch, selectedCategory: null, matchedItemId: null, quantity: null, totalPrice: null, completedAt: null }, replies: greeting.replies };
}

async function promptFor(enquiry: EnquiryFields, deps: Deps): Promise<string[]> {
  switch (enquiry.state) {
    case "AWAITING_CATEGORY":
      return [renderCategoryMenu(await deps.getAvailableCategories())];
    case "AWAITING_ITEM_SELECTION": {
      if (!enquiry.selectedCategory) return [renderCategoryMenu(await deps.getAvailableCategories())];
      const items = await deps.getItemsForCategory(enquiry.selectedCategory);
      const currency = await deps.getCurrencySymbol();
      return [renderItemMenu(enquiry.selectedCategory, items, currency)];
    }
    case "AWAITING_QUANTITY":
      return [`How many would you like? (reply with a number, e.g. 1)`];
    default:
      return (await handleGreeting(deps)).replies;
  }
}

function parseMenuIndex(body: string, optionCount: number): number | null {
  const n = Number.parseInt(body.trim(), 10);
  if (!Number.isInteger(n) || n < 1 || n > optionCount) return null;
  return n - 1;
}

function renderCategoryMenu(categories: string[]): string {
  const lines = categories.map((c, i) => `${i + 1}. ${c}`);
  return `What would you like to browse?\n${lines.join("\n")}\n\n(Reply with a number)`;
}

function renderItemMenu(category: string, items: CatalogItemLite[], currency: string): string {
  const lines = items.map((item, i) => `${i + 1}. ${item.name} — ${currency}${item.price.toFixed(2)}`);
  return `${category}:\n${lines.join("\n")}\n\n(Reply with a number)`;
}
