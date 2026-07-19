import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { brands, contacts, outreachLog } from "@/db/schema";
import { StatusBadge } from "@/components/status-badge";
import { StatusControl } from "@/components/status-control";
import { FunnelStepper } from "@/components/funnel-stepper";
import { IconArrowLeft, IconExternal } from "@/components/icons";
import { ALLOWED_TRANSITIONS } from "@/lib/status";
import { formatGmv, formatDate } from "@/lib/format";

export default async function BrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brandId = Number(id);
  if (!Number.isInteger(brandId) || brandId <= 0) notFound();

  const [brand] = await db.select().from(brands).where(eq(brands.id, brandId)).limit(1);
  if (!brand) notFound();

  const contactRows = await db
    .select()
    .from(contacts)
    .where(eq(contacts.brandId, brandId))
    .orderBy(desc(contacts.id));

  const log = await db
    .select()
    .from(outreachLog)
    .where(eq(outreachLog.brandId, brandId))
    .orderBy(desc(outreachLog.id));

  const contact = contactRows[0];
  const nextOptions = ALLOWED_TRANSITIONS[brand.status];

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <Link href="/pipeline" className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fog">
          <IconArrowLeft width={15} height={15} />
          Pipeline
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold tracking-tight text-fog">{brand.brandName}</h1>
          <StatusBadge status={brand.status} size="md" />
        </div>
        <p className="mt-1 font-mono text-sm text-muted">@{brand.tiktokHandle}</p>
      </div>

      {/* Funnel rail */}
      <section className="panel p-6">
        <p className="kicker mb-5">Funnel position</p>
        <FunnelStepper status={brand.status} />
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="panel p-6">
          <p className="kicker mb-4">Brand</p>
          <dl className="space-y-3 text-sm">
            <Row label="Monthly GMV" value={<span className="font-mono text-fog">{formatGmv(brand.monthlyGmv)}</span>} />
            <Row label="Category" value={brand.category ?? "·"} />
            <Row label="Domain" value={brand.domain ?? "·"} />
            <Row label="Contact type" value={brand.contactType ? brand.contactType.toUpperCase() : "·"} mono />
            <Row label="Date sourced" value={formatDate(brand.dateSourced)} />
            <Row label="Assigned student" value={brand.assignedStudentId ?? "·"} mono />
          </dl>
        </section>

        <section className="panel p-6">
          <p className="kicker mb-4">Contact</p>
          {!contact ? (
            <div className="flex h-[140px] flex-col items-center justify-center rounded-lg border border-dashed border-line-2 text-center">
              <p className="text-sm text-muted">No contact enriched yet</p>
              <p className="mt-1 text-xs text-faint">Clay pushes this via the enrichment webhook.</p>
            </div>
          ) : (
            <dl className="space-y-3 text-sm">
              <Row label="Name" value={contact.contactName ?? "·"} />
              <Row label="Title" value={contact.title ?? "·"} />
              <Row
                label="Email"
                value={
                  contact.email ? (
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-fog">{contact.email}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase ${
                          contact.emailVerified
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-amber-400/15 text-amber-300"
                        }`}
                      >
                        {contact.emailVerified ? "verified" : "unverified"}
                      </span>
                    </span>
                  ) : (
                    "·"
                  )
                }
              />
              <Row
                label="LinkedIn"
                value={
                  contact.linkedinUrl ? (
                    <a
                      href={contact.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-acid hover:underline"
                    >
                      Profile <IconExternal width={13} height={13} />
                    </a>
                  ) : (
                    "·"
                  )
                }
              />
            </dl>
          )}
        </section>
      </div>

      {/* Status actions */}
      <section className="panel p-6">
        <p className="kicker mb-4">Advance status</p>
        <StatusControl brandId={brand.id} nextOptions={nextOptions} />
      </section>

      {/* Outreach timeline */}
      <section className="panel p-6">
        <p className="kicker mb-4">Outreach log</p>
        {log.length === 0 ? (
          <p className="text-sm text-muted">No outreach logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  {["Channel", "Step", "Sent", "Opened", "Replied", "Sentiment"].map((h) => (
                    <th key={h} className="pb-2 pr-4 font-mono text-[10px] uppercase tracking-wider text-faint">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {log.map((e) => (
                  <tr key={e.id} className="border-b border-line/50 last:border-0">
                    <td className="py-2.5 pr-4 capitalize text-fog">{e.channel}</td>
                    <td className="py-2.5 pr-4 font-mono text-muted">{e.sequenceStep ?? "·"}</td>
                    <td className="py-2.5 pr-4 text-muted">{formatDate(e.sentAt)}</td>
                    <td className="py-2.5 pr-4">{e.opened ? <Dot ok /> : <span className="text-faint">·</span>}</td>
                    <td className="py-2.5 pr-4">{e.replied ? <Dot ok /> : <span className="text-faint">·</span>}</td>
                    <td className="py-2.5 pr-4 capitalize text-muted">{e.replySentiment ?? "·"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={`text-right text-fog ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

function Dot({ ok }: { ok?: boolean }) {
  return (
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{ backgroundColor: ok ? "#34D399" : "rgba(255,255,255,0.2)" }}
    />
  );
}
