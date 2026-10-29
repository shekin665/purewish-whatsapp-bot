import { NextRequest, NextResponse } from "next/server";
import { processIncomingMessage } from "@/lib/whatsapp/engine";

// Standing test harness, not part of the real WhatsApp integration — lets
// the whole multi-turn conversation be verified with curl, with no Twilio
// account and no public URL required.
export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  const phone = typeof payload?.phone === "string" ? payload.phone : null;
  const body = typeof payload?.body === "string" ? payload.body : null;

  if (!phone || !body) {
    return NextResponse.json({ error: "phone and body are required strings" }, { status: 400 });
  }

  const result = await processIncomingMessage(phone, body);
  const documentUrl = result.documentPath
    ? new URL(result.documentPath, req.nextUrl.origin).toString()
    : undefined;

  return NextResponse.json({ replies: result.replies, documentUrl, enquiry: result.enquiry });
}
