import * as store from "./store";
import { processMessage, type Deps } from "./fsm";
import { normalizePhone } from "./phone";

const deps: Deps = {
  getAvailableCategories: store.getAvailableCategories,
  getItemsForCategory: store.getItemsForCategory,
  getItemById: store.getItemById,
  getBusinessName: store.getBusinessName,
  getCurrencySymbol: store.getCurrencySymbol,
};

export async function processIncomingMessage(rawPhone: string, body: string) {
  const phone = normalizePhone(rawPhone);
  const enquiry = await store.getActiveEnquiry(phone);

  await store.logMessage(enquiry.id, "INBOUND", body);

  const result = await processMessage(enquiry, body, deps);

  const updated =
    Object.keys(result.patch).length > 0
      ? await store.updateEnquiry(enquiry.id, result.patch)
      : enquiry;

  for (const reply of result.replies) {
    await store.logMessage(enquiry.id, "OUTBOUND", reply);
  }

  return {
    replies: result.replies,
    // Relative path — the caller (webhook vs. simulate route) resolves it
    // against whatever base URL makes sense for that channel.
    documentPath: result.includeDocumentLink ? `/api/confirmation/${enquiry.id}` : undefined,
    enquiry: updated,
  };
}
