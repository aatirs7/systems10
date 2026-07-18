"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BrandStatus } from "@/db/schema";
import { STATUS_LABELS } from "@/lib/status";
import { updateStatus } from "@/app/(admin)/actions";

export function StatusControl({
  brandId,
  current,
  nextOptions,
}: {
  brandId: number;
  current: BrandStatus;
  nextOptions: BrandStatus[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState("");

  function move(to: BrandStatus) {
    setError(null);
    startTransition(async () => {
      const res = await updateStatus(brandId, to, to === "assigned" ? studentId : undefined);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  if (nextOptions.length === 0) {
    return <p className="text-sm text-neutral-500">No further transitions from this status.</p>;
  }

  return (
    <div className="space-y-3">
      {nextOptions.includes("assigned") && (
        <label className="block text-sm">
          <span className="mb-1 block text-neutral-600">Student ID (required to assign)</span>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="student id"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {nextOptions.map((s) => (
          <button
            key={s}
            onClick={() => move(s)}
            disabled={pending || (s === "assigned" && !studentId.trim())}
            className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
              s === "archived"
                ? "border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                : "bg-neutral-900 text-white hover:bg-neutral-800"
            }`}
          >
            Move to {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-neutral-400">Current: {STATUS_LABELS[current]}</p>
    </div>
  );
}
