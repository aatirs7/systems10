import Link from "next/link";
import { and, desc, asc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { brands, type BrandStatus, type ContactType } from "@/db/schema";
import { BRAND_STATUSES, STATUS_LABELS } from "@/lib/status";
import { StatusBadge } from "@/components/status-badge";
import { formatGmv } from "@/lib/format";

type SearchParams = Promise<{
  status?: string;
  contactType?: string;
  q?: string;
  sort?: string;
}>;

export default async function PipelinePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const conditions: SQL[] = [];
  if (sp.status && BRAND_STATUSES.includes(sp.status as BrandStatus)) {
    conditions.push(eq(brands.status, sp.status as BrandStatus));
  }
  if (sp.contactType === "owner" || sp.contactType === "generic") {
    conditions.push(eq(brands.contactType, sp.contactType as ContactType));
  }
  if (sp.q && sp.q.trim()) {
    const term = `%${sp.q.trim()}%`;
    conditions.push(or(ilike(brands.brandName, term), ilike(brands.tiktokHandle, term))!);
  }

  const orderBy =
    sp.sort === "gmv_asc"
      ? asc(brands.monthlyGmv)
      : sp.sort === "name"
        ? asc(brands.brandName)
        : desc(brands.monthlyGmv);

  const rows = await db
    .select()
    .from(brands)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(orderBy)
    .limit(500);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pipeline</h1>
        <span className="text-sm text-neutral-500">{rows.length} brands</span>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4">
        <label className="text-sm">
          <span className="mb-1 block text-neutral-600">Search</span>
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Brand or handle"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-neutral-600">Status</span>
          <select
            name="status"
            defaultValue={sp.status ?? ""}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            {BRAND_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-neutral-600">Contact</span>
          <select
            name="contactType"
            defaultValue={sp.contactType ?? ""}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="owner">Owner</option>
            <option value="generic">Generic</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-neutral-600">Sort</span>
          <select
            name="sort"
            defaultValue={sp.sort ?? "gmv_desc"}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          >
            <option value="gmv_desc">GMV (high to low)</option>
            <option value="gmv_asc">GMV (low to high)</option>
            <option value="name">Name</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Apply
        </button>
        <Link href="/pipeline" className="px-2 py-1.5 text-sm text-neutral-500 hover:text-neutral-900">
          Reset
        </Link>
      </form>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Brand</th>
              <th className="px-4 py-2 font-medium">Handle</th>
              <th className="px-4 py-2 font-medium">GMV</th>
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 font-medium">Contact</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  No brands match. Import a Kalodata CSV to get started.
                </td>
              </tr>
            )}
            {rows.map((b) => (
              <tr key={b.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-2">
                  <Link href={`/brands/${b.id}`} className="font-medium text-neutral-900 hover:underline">
                    {b.brandName}
                  </Link>
                </td>
                <td className="px-4 py-2 text-neutral-600">{b.tiktokHandle}</td>
                <td className="px-4 py-2 tabular-nums">{formatGmv(b.monthlyGmv)}</td>
                <td className="px-4 py-2 text-neutral-600">{b.category ?? "-"}</td>
                <td className="px-4 py-2 text-neutral-600">{b.contactType ?? "-"}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
