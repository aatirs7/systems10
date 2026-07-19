import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { brands, contacts } from "@/db/schema";
import { formatGmv } from "@/lib/format";
import { IconArrowRight } from "@/components/icons";

// Reply review (spec §3.7): brands that replied positive and are waiting on the closer.
export default async function RepliesPage() {
  const rows = await db
    .select({ brand: brands, contact: contacts })
    .from(brands)
    .leftJoin(contacts, eq(contacts.brandId, brands.id))
    .where(eq(brands.status, "interested"))
    .orderBy(desc(brands.monthlyGmv));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="animate-fade-up">
        <p className="kicker">Awaiting the qualification call</p>
        <div className="mt-1 flex items-end justify-between">
          <h1 className="font-display text-3xl font-bold tracking-tight text-fog">Interested replies</h1>
          <span className="font-mono text-sm text-muted">
            <span className="text-acid">{rows.length}</span> to action
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Brands that replied positive. Book the Calendly call, then open the brand and move it to{" "}
          <span className="text-fog">Closed</span> once the deal is done.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="panel flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-muted">No interested replies yet.</p>
          <p className="mt-1 text-xs text-faint">Positive replies land here automatically via the reply webhook.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map(({ brand, contact }) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.id}`}
              className="group panel p-5 transition hover:border-line-2 hover:bg-fog/[0.03]"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-lg font-semibold text-fog">{brand.brandName}</h3>
                  <p className="font-mono text-xs text-muted">@{brand.tiktokHandle}</p>
                </div>
                <span className="font-mono text-sm tabular-nums text-acid">{formatGmv(brand.monthlyGmv)}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <div className="min-w-0 text-sm">
                  <span className="text-fog">{contact?.contactName ?? "No contact"}</span>
                  {contact?.email && <span className="ml-2 truncate font-mono text-xs text-muted">{contact.email}</span>}
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-acid opacity-0 transition group-hover:opacity-100">
                  Open <IconArrowRight width={13} height={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
