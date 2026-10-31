import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { processIncomingMessage } from "@/lib/whatsapp/engine";
import { isTwilioSignatureValid } from "@/lib/whatsapp/verify-signature";
import { getPublicBaseUrl } from "@/lib/base-url";

export async function POST(req: NextRequest) {
  const formData = await req.formData(); // Twilio posts x-www-form-urlencoded
  const params: Record<string, string> = {};
  for (const [k, v] of formData.entries()) params[k] = String(v);

  // Twilio signs the exact public URL it invoked, so this must match what
  // Twilio actually called, not the server's internal bind address.
  const base = getPublicBaseUrl(req);
  const url = `${base}${req.nextUrl.pathname}`;
  const signature = req.headers.get("X-Twilio-Signature");

  if (!isTwilioSignatureValid({ url, params, signatureHeader: signature })) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const from = params["From"];
  const body = params["Body"];
  if (!from || !body) return new NextResponse("Missing From/Body", { status: 400 });

  const result = await processIncomingMessage(from, body);

  const twiml = new twilio.twiml.MessagingResponse();
  result.replies.forEach((reply, i) => {
    const message = twiml.message(reply);
    const isLast = i === result.replies.length - 1;
    if (isLast && result.documentPath) {
      const mediaUrl = `${base}${result.documentPath}`;
      // Twilio only fetches https:// media URLs. Without a real public base
      // URL configured, skip attaching media rather than sending a broken
      // link — the document is still reachable directly via GET for testing.
      if (mediaUrl.startsWith("https://")) message.media(mediaUrl);
    }
  });

  return new NextResponse(twiml.toString(), { status: 200, headers: { "Content-Type": "text/xml" } });
}
