import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enquiry = await prisma.enquiry.findUnique({
    where: { id },
    include: { matchedItem: true, messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!enquiry) notFound();

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link href="/admin/enquiries" className="text-sm text-blue-600 hover:underline">
        ← Back
      </Link>
      <h1 className="mb-4 mt-2 text-2xl font-semibold">Enquiry {enquiry.id}</h1>

      <div className="mb-6 rounded border p-4 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-gray-500">Phone</div>
          <div>{enquiry.phone}</div>
          <div className="text-gray-500">State</div>
          <div>{enquiry.state}</div>
          <div className="text-gray-500">Matched item</div>
          <div>{enquiry.matchedItem?.name ?? "—"}</div>
          <div className="text-gray-500">Quantity</div>
          <div>{enquiry.quantity ?? "—"}</div>
          <div className="text-gray-500">Total</div>
          <div>{enquiry.totalPrice != null ? enquiry.totalPrice.toFixed(2) : "—"}</div>
        </div>
        {enquiry.state === "COMPLETED" && (
          <a
            className="mt-3 inline-block text-blue-600 hover:underline"
            href={`/api/confirmation/${enquiry.id}`}
            target="_blank"
            rel="noreferrer"
          >
            Download PDF →
          </a>
        )}
      </div>

      <h2 className="mb-2 text-lg font-medium">Conversation</h2>
      <div className="flex flex-col gap-2">
        {enquiry.messages.map((m) => (
          <div key={m.id} className={`flex ${m.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                m.direction === "OUTBOUND" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              {m.body}
            </div>
          </div>
        ))}
        {enquiry.messages.length === 0 && <p className="text-gray-400">No messages yet.</p>}
      </div>
    </div>
  );
}
