"use client";

import { useState } from "react";
import Link from "next/link";
import { uploadKalodataCsv, type IngestActionResult } from "../actions";

export default function UploadPage() {
  const [result, setResult] = useState<IngestActionResult | null>(null);
  const [pending, setPending] = useState(false);

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
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">Import Kalodata CSV</h1>
      <p className="text-sm text-neutral-600">
        Upload a Kalodata export. New brands are added as <strong>sourced</strong>; brands already
        in the pipeline (matched by TikTok handle) have their monthly GMV refreshed without
        resetting their status.
      </p>

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-800"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending ? "Importing..." : "Import"}
        </button>
      </form>

      {result && result.ok && (
        <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <p className="font-medium text-emerald-900">Import complete</p>
          <ul className="text-emerald-800">
            <li>Rows read: {result.summary.totalRows}</li>
            <li>Inserted (new): {result.summary.inserted}</li>
            <li>Refreshed (existing): {result.summary.refreshed}</li>
            <li>Invalid / skipped: {result.summary.invalid.length}</li>
          </ul>
          {result.summary.invalid.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-emerald-900">View skipped rows</summary>
              <ul className="mt-1 list-disc pl-5 text-neutral-600">
                {result.summary.invalid.slice(0, 50).map((iv, i) => (
                  <li key={i}>
                    Row {iv.row}: {iv.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <Link href="/pipeline" className="mt-2 inline-block font-medium text-emerald-900 underline">
            View pipeline
          </Link>
        </div>
      )}

      {result && !result.ok && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {result.error}
        </div>
      )}
    </div>
  );
}
