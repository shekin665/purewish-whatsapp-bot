import PDFDocument from "pdfkit";

type ConfirmationData = {
  business: { name: string; logoText: string; colorPrimary: string; colorAccent: string; currencySymbol: string };
  enquiry: {
    id: string;
    phone: string;
    quantity: number | null;
    totalPrice: number | null;
    completedAt: Date | null;
  };
  item: { name: string; description: string | null; price: number } | null;
};

export async function renderConfirmationBuffer(data: ConfirmationData): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 0 });
  const chunks: Buffer[] = [];

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  drawHeader(doc, data);
  drawSummaryBox(doc, data);
  drawDetails(doc, data);
  drawFooter(doc, data);

  doc.end();
  return done;
}

function drawHeader(doc: PDFKit.PDFDocument, { business }: ConfirmationData) {
  doc.rect(0, 0, doc.page.width, 110).fill(business.colorPrimary);
  doc
    .fillColor("#ffffff")
    .fontSize(22)
    .font("Helvetica-Bold")
    .text(business.logoText.toUpperCase(), 50, 35);
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(business.name, 50, 65);
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Order Confirmation", 0, 45, { align: "right", width: doc.page.width - 50 });
  doc.y = 140;
}

function drawSummaryBox(doc: PDFKit.PDFDocument, { enquiry, item, business }: ConfirmationData) {
  const startY = doc.y;
  doc.fillColor("#000000").font("Helvetica-Bold").fontSize(12).text("Order Summary", 50, startY);
  doc.moveDown(0.5);

  const rows: [string, string][] = [
    ["Order ID", enquiry.id],
    ["Phone", enquiry.phone],
    ["Item", item ? item.name : "To be confirmed"],
    ["Quantity", enquiry.quantity != null ? String(enquiry.quantity) : "To be confirmed"],
    [
      "Total",
      enquiry.totalPrice != null ? `${business.currencySymbol}${enquiry.totalPrice.toFixed(2)}` : "To be confirmed",
    ],
    ["Date", enquiry.completedAt ? enquiry.completedAt.toLocaleString() : "In progress"],
  ];

  const labelX = 50;
  const valueX = 220;
  let y = doc.y + 8;
  for (const [label, value] of rows) {
    doc.font("Helvetica").fontSize(10).fillColor("#555555").text(label, labelX, y, { width: 150 });
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#000000").text(value, valueX, y, { width: 320 });
    y += 22;
  }
  doc.y = y + 10;
}

function drawDetails(doc: PDFKit.PDFDocument, { item, business }: ConfirmationData) {
  if (!item?.description) return;
  doc.font("Helvetica-Bold").fontSize(12).fillColor(business.colorAccent).text("Details", 50, doc.y);
  doc.moveDown(0.4);
  doc.font("Helvetica").fontSize(10).fillColor("#333333").text(item.description, 50, doc.y, { width: 495 });
  doc.moveDown(1);
}

function drawFooter(doc: PDFKit.PDFDocument, { enquiry, business }: ConfirmationData) {
  const y = doc.page.height - 80;
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#888888")
    .text(`Enquiry ${enquiry.id} · ${business.name} will follow up to confirm payment and delivery/pickup details.`, 50, y, {
      width: 495,
      align: "center",
    });
}
