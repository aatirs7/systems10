"use client";

import { useState } from "react";
import Link from "next/link";
import { uploadKalodataCsv, type IngestActionResult } from "../actions";
import { IconUpload, IconArrowRight } from "@/components/icons";

export default function UploadPage() {
  const [result, setResult] = useState<IngestActionResult | null>(null);
  const [pending, setPending] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setResult(null);
    const formData = new FormData(e.currentTarget);
    const res = await uploadKalodataCsv(formData);
    setResult(res);
    setPending(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="animate-fade-up">
        <p className="kicker">Sourcing</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-fog">Import Kalodata CSV</h1>
        <p className="mt-3 text-sm text-muted">
          New brands are added as <span className="text-fog">Sourced</span>. Brands already in the pipeline
          (matched by TikTok handle) have their monthly GMV refreshed without resetting their status.
        </p>
      </header>

      <form onSubmit={onSubmit} className="panel space-y-5 p-6">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line-2 bg-canvas/50 px-6 py-12 text-center transition hover:border-acid/40 hover:bg-fog/[0.02]">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-acid/10 text-acid">
            <IconUpload width={22} height={22} />
          </span>
          <span className="text-sm text-fog">
            {fileName ?? "Choose a CSV file"}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
            brand · handle · gmv · category
          </span>
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            className="hidden"
          />
        </label>
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Importing…" : "Import brands"}
          {!pending && <IconArrowRight width={16} height={16} />}
        </button>
      </form>

      {result?.ok && (
        <div className="panel space-y-4 p-6">
          <p className="kicker text-acid">Import complete</p>
          <div className="grid grid-cols-4 gap-3">
            <Stat label="Rows" value={result.summary.totalRows} />
            <Stat label="Inserted" value={result.summary.inserted} accent />
            <Stat label="Refreshed" value={result.summary.refreshed} />
            <Stat label="Skipped" value={result.summary.invalid.length} />
          </div>
          {result.summary.invalid.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted hover:text-fog">View skipped rows</summary>
              <ul className="mt-2 space-y-1 font-mono text-xs text-faint">
                {result.summary.invalid.slice(0, 50).map((iv, i) => (
                  <li key={i}>row {iv.row}: {iv.reason}</li>
                ))}
              </ul>
            </details>
          )}
          <Link href="/pipeline" className="inline-flex items-center gap-1.5 text-sm text-acid hover:underline">
            View pipeline <IconArrowRight width={14} height={14} />
          </Link>
        </div>
      )}

      {result && !result.ok && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {result.error}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-canvas/50 p-3">
      <div className={`font-display text-2xl font-semibold ${accent ? "text-acid" : "text-fog"}`}>{value}</div>
      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-faint">{label}</div>
    </div>
  );
}
