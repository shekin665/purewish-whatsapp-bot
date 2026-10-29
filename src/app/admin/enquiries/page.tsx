import Link from "next/link";
import { prisma } from "@/lib/prisma";

function StateBadge({ state }: { state: string }) {
  const isDone = state === "COMPLETED";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        isDone ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
      }`}
    >
      {state.replaceAll("_", " ")}
    </span>
  );
}

export default async function EnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({
    include: { matchedItem: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Enquiries</h1>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="py-2 pr-4">Phone</th>
            <th className="py-2 pr-4">State</th>
            <th className="py-2 pr-4">Matched item</th>
            <th className="py-2 pr-4">Created</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {enquiries.map((e) => (
            <tr key={e.id} className="border-b">
              <td className="py-2 pr-4">{e.phone}</td>
              <td className="py-2 pr-4">
                <StateBadge state={e.state} />
              </td>
              <td className="py-2 pr-4">{e.matchedItem?.name ?? "—"}</td>
              <td className="py-2 pr-4">{new Date(e.createdAt).toLocaleString()}</td>
              <td className="py-2 pr-4">
                <Link className="text-blue-600 hover:underline" href={`/admin/enquiries/${e.id}`}>
                  View →
                </Link>
              </td>
            </tr>
          ))}
          {enquiries.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-400">
                No enquiries yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
