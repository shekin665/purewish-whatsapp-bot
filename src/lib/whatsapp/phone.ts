// Twilio prefixes WhatsApp numbers with "whatsapp:"; strip it so Enquiry.phone
// stays a plain, comparable phone number regardless of channel.
export function normalizePhone(rawPhone: string): string {
  return rawPhone.replace(/^whatsapp:/i, "").trim();
}
