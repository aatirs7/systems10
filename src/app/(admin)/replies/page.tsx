import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { brands, contacts } from "@/db/schema";
import { formatGmv } from "@/lib/format";

// Reply review (spec §3.7): brands that replied positive and are waiting on the closer.
export default async function RepliesPage() {
  const rows = await db
    .select({ brand: brands, contact: contacts })
    .from(brands)
    .leftJoin(contacts, eq(contacts.brandId, brands.id))
    .where(eq(brands.status, "interested"))
    .orderBy(desc(brands.monthlyGmv));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Interested replies</h1>
        <span className="text-sm text-neutral-500">{rows.length} awaiting a call</span>
      </div>
      <p className="text-sm text-neutral-600">
        Brands that replied positive and are ready for the qualification call. Open a brand to book
        the call and move it to <strong>closed</strong> once the deal is done.
      </p>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Brand</th>
              <th className="px-4 py-2 font-medium">GMV</th>
              <th className="px-4 py-2 font-medium">Contact</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  No interested replies yet.
                </td>
              </tr>
            )}
            {rows.map(({ brand, contact }) => (
              <tr key={brand.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-2">
                  <Link href={`/brands/${brand.id}`} className="font-medium hover:underline">
                    {brand.brandName}
                  </Link>
                  <div className="text-xs text-neutral-500">{brand.tiktokHandle}</div>
                </td>
                <td className="px-4 py-2 tabular-nums">{formatGmv(brand.monthlyGmv)}</td>
                <td className="px-4 py-2 text-neutral-600">{contact?.contactName ?? "-"}</td>
                <td className="px-4 py-2 text-neutral-600">{contact?.email ?? "-"}</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/brands/${brand.id}`} className="text-sm font-medium text-sky-700 hover:underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
