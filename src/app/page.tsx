import { getBusiness } from "@/lib/business";

export default async function Home() {
  const business = await getBusiness();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-10">
      <h1 className="text-3xl font-semibold">{business.name} — WhatsApp Ordering Demo</h1>
      <p className="text-gray-600">
        This is a working demo of a WhatsApp ordering bot. A customer messages in, picks from a
        menu, confirms a quantity, and gets back a branded PDF order confirmation — automatically.
      </p>
      <div className="rounded border p-4">
        <p className="mb-2 font-medium">Try it without WhatsApp:</p>
        <pre className="overflow-x-auto rounded bg-gray-900 p-3 text-xs text-gray-100">
{`curl -X POST ${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/whatsapp/simulate \\
  -H "Content-Type: application/json" \\
  -d '{"phone":"+15551234567","body":"hi"}'`}
        </pre>
      </div>
      <a className="text-blue-600 hover:underline" href="/admin/enquiries">
        View incoming enquiries →
      </a>
    </div>
  );
}
