import twilio from "twilio";

export function isTwilioSignatureValid({
  url,
  params,
  signatureHeader,
}: {
  url: string;
  params: Record<string, string>;
  signatureHeader: string | null;
}): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  // No real Twilio credentials configured — nothing to validate against.
  // Normal state for local dev / any environment without a real Twilio
  // account; set TWILIO_AUTH_TOKEN to turn the check on for real traffic.
  if (!authToken) return true;
  if (!signatureHeader) return false;
  return twilio.validateRequest(authToken, signatureHeader, url, params);
}
