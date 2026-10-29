import { NextRequest, NextResponse } from "next/server";
import { getEnquiryWithItem } from "@/lib/whatsapp/store";
import { getBusiness } from "@/lib/business";
import { renderConfirmationBuffer } from "@/lib/whatsapp/confirmation-pdf";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ enquiryId: string }> }
) {
  const { enquiryId } = await params;
  const enquiry = await getEnquiryWithItem(enquiryId);

  if (!enquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!enquiry.matchedItem) {
    return new NextResponse("No item selected yet — nothing to show.", { status: 409 });
  }

  const business = await getBusiness();
  const buffer = await renderConfirmationBuffer({
    business,
    enquiry,
    item: enquiry.matchedItem
      ? { name: enquiry.matchedItem.name, description: enquiry.matchedItem.description, price: enquiry.matchedItem.price }
      : null,
  });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${enquiry.id}.pdf"`,
      "Content-Length": String(buffer.length),
    },
  });
}
