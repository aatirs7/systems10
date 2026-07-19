import Link from "next/link";
import { and, desc, asc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { brands, type BrandStatus, type ContactType } from "@/db/schema";
import { BRAND_STATUSES, STATUS_LABELS, STATUS_HUE, FUNNEL_ORDER } from "@/lib/status";
import { StatusBadge } from "@/components/status-badge";
import { IconSearch, IconArrowRight } from "@/components/icons";
import { formatGmv } from "@/lib/format";

type SearchParams = Promise<{
  status?: string;
  contactType?: string;
  q?: string;
  sort?: string;
}>;

export default async function PipelinePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const activeStatus =
    sp.status && BRAND_STATUSES.includes(sp.status as BrandStatus)
      ? (sp.status as BrandStatus)
      : null;

  const conditions: SQL[] = [];
  if (activeStatus) conditions.push(eq(brands.status, activeStatus));
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

  const [rows, counts] = await Promise.all([
    db
      .select()
      .from(brands)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(500),
    db
      .select({ status: brands.status, count: sql<number>`count(*)::int` })
      .from(brands)
      .groupBy(brands.status),
  ]);

  const countBy = Object.fromEntries(counts.map((c) => [c.status, c.count])) as Record<
    BrandStatus,
    number
  >;
  const total = counts.reduce((a, c) => a + c.count, 0);

  const preserve = new URLSearchParams();
  if (sp.q) preserve.set("q", sp.q);
  if (sp.contactType) preserve.set("contactType", sp.contactType);
  if (sp.sort) preserve.set("sort", sp.sort);
  const statusHref = (s: BrandStatus | null) => {
    const p = new URLSearchParams(preserve);
    if (s) p.set("status", s);
    const qs = p.toString();
    return `/pipeline${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-8">
      <header className="animate-fade-up">
        <p className="kicker">Acquisition pipeline</p>
        <div className="mt-1 flex items-end justify-between">
          <h1 className="font-display text-3xl font-bold tracking-tight text-fog">Pipeline</h1>
          <span className="font-mono text-sm text-muted">
            <span className="text-fog">{total}</span> brands tracked
          </span>
        </div>
      </header>

      {/* Funnel strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {FUNNEL_ORDER.map((s, i) => {
          const active = activeStatus === s;
          const hue = STATUS_HUE[s];
          return (
            <Link
              key={s}
              href={active ? statusHref(null) : statusHref(s)}
              style={{ animationDelay: `${i * 45}ms` }}
              className={`animate-fade-up rounded-xl border p-3 transition ${
                active
                  ? "border-transparent bg-fog/[0.06]"
                  : "border-line bg-panel/50 hover:border-line-2 hover:bg-fog/[0.03]"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: hue }} />
                <span className="truncate font-mono text-[10px] uppercase tracking-wider text-faint">
                  {STATUS_LABELS[s]}
                </span>
              </div>
              <div className="mt-2 font-display text-2xl font-semibold text-fog">
                {countBy[s] ?? 0}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Filters */}
      <form className="panel flex flex-wrap items-end gap-3 p-4">
        <label className="min-w-[200px] flex-1">
          <span className="kicker mb-1.5 block">Search</span>
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Brand or handle"
              className="field pl-9"
            />
          </div>
        </label>
        <label>
          <span className="kicker mb-1.5 block">Status</span>
          <select name="status" defaultValue={sp.status ?? ""} className="field">
            <option value="">All</option>
            {BRAND_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="kicker mb-1.5 block">Contact</span>
          <select name="contactType" defaultValue={sp.contactType ?? ""} className="field">
            <option value="">All</option>
            <option value="owner">Owner</option>
            <option value="generic">Generic</option>
          </select>
        </label>
        <label>
          <span className="kicker mb-1.5 block">Sort</span>
          <select name="sort" defaultValue={sp.sort ?? "gmv_desc"} className="field">
            <option value="gmv_desc">GMV high → low</option>
            <option value="gmv_asc">GMV low → high</option>
            <option value="name">Name A → Z</option>
          </select>
        </label>
        <button type="submit" className="btn-primary">
          Apply
        </button>
        <Link href="/pipeline" className="btn-ghost">
          Reset
        </Link>
      </form>

      {/* Table */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                {["Brand", "Handle", "GMV / mo", "Category", "Contact", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-faint"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <p className="text-sm text-muted">No brands match these filters.</p>
                    <Link href="/upload" className="mt-2 inline-block text-sm text-acid hover:underline">
                      Import a Kalodata CSV →
                    </Link>
                  </td>
                </tr>
              )}
              {rows.map((b) => (
                <tr
                  key={b.id}
                  className="group border-b border-line/60 transition last:border-0 hover:bg-fog/[0.025]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/brands/${b.id}`}
                      className="flex items-center gap-2 font-medium text-fog"
                    >
                      {b.brandName}
                      <IconArrowRight
                        width={13}
                        height={13}
                        className="text-faint opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">@{b.tiktokHandle}</td>
                  <td className="px-4 py-3 font-mono tabular-nums text-fog">
                    {formatGmv(b.monthlyGmv)}
                  </td>
                  <td className="px-4 py-3 text-muted">{b.category ?? "·"}</td>
                  <td className="px-4 py-3">
                    {b.contactType ? (
                      <span className="font-mono text-xs uppercase tracking-wide text-muted">
                        {b.contactType}
                      </span>
                    ) : (
                      <span className="text-faint">·</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
