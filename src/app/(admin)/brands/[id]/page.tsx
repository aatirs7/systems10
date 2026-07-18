import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { brands, contacts, outreachLog } from "@/db/schema";
import { StatusBadge } from "@/components/status-badge";
import { StatusControl } from "@/components/status-control";
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

  const nextOptions = ALLOWED_TRANSITIONS[brand.status];

  return (
    <div className="space-y-8">
      <div>
        <Link href="/pipeline" className="text-sm text-neutral-500 hover:text-neutral-900">
          &larr; Back to pipeline
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{brand.brandName}</h1>
          <StatusBadge status={brand.status} />
        </div>
        <p className="text-sm text-neutral-500">{brand.tiktokHandle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-neutral-500">Brand</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Monthly GMV" value={formatGmv(brand.monthlyGmv)} />
            <Row label="Category" value={brand.category ?? "-"} />
            <Row label="Domain" value={brand.domain ?? "-"} />
            <Row label="Contact type" value={brand.contactType ?? "-"} />
            <Row label="Date sourced" value={formatDate(brand.dateSourced)} />
            <Row label="Assigned student" value={brand.assignedStudentId ?? "-"} />
          </dl>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-neutral-500">Contact</h2>
          {contactRows.length === 0 ? (
            <p className="text-sm text-neutral-400">No contact enriched yet.</p>
          ) : (
            <dl className="space-y-2 text-sm">
              <Row label="Name" value={contactRows[0].contactName ?? "-"} />
              <Row label="Title" value={contactRows[0].title ?? "-"} />
              <Row
                label="Email"
                value={
                  contactRows[0].email
                    ? `${contactRows[0].email}${contactRows[0].emailVerified ? " (verified)" : " (unverified)"}`
                    : "-"
                }
              />
              <Row
                label="LinkedIn"
                value={
                  contactRows[0].linkedinUrl ? (
                    <a
                      href={contactRows[0].linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-700 underline"
                    >
                      Profile
                    </a>
                  ) : (
                    "-"
                  )
                }
              />
            </dl>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-neutral-500">Status</h2>
        <StatusControl brandId={brand.id} current={brand.status} nextOptions={nextOptions} />
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-neutral-500">Outreach log</h2>
        {log.length === 0 ? (
          <p className="text-sm text-neutral-400">No outreach logged yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-neutral-500">
              <tr>
                <th className="py-1 font-medium">Channel</th>
                <th className="py-1 font-medium">Step</th>
                <th className="py-1 font-medium">Sent</th>
                <th className="py-1 font-medium">Opened</th>
                <th className="py-1 font-medium">Replied</th>
                <th className="py-1 font-medium">Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {log.map((e) => (
                <tr key={e.id} className="border-t border-neutral-100">
                  <td className="py-1 capitalize">{e.channel}</td>
                  <td className="py-1">{e.sequenceStep ?? "-"}</td>
                  <td className="py-1">{formatDate(e.sentAt)}</td>
                  <td className="py-1">{e.opened ? "Yes" : "-"}</td>
                  <td className="py-1">{e.replied ? "Yes" : "-"}</td>
                  <td className="py-1 capitalize">{e.replySentiment ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right font-medium text-neutral-900">{value}</dd>
    </div>
  );
}
