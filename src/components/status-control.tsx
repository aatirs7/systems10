"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BrandStatus } from "@/db/schema";
import { STATUS_LABELS, STATUS_HUE } from "@/lib/status";
import { updateStatus } from "@/app/(admin)/actions";
import { IconArrowRight } from "@/components/icons";

export function StatusControl({
  brandId,
  nextOptions,
}: {
  brandId: number;
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
    return <p className="text-sm text-muted">This brand has reached a terminal status.</p>;
  }

  return (
    <div className="space-y-4">
      {nextOptions.includes("assigned") && (
        <label className="block">
          <span className="kicker mb-1.5 block">Student ID (required to assign)</span>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="student id"
            className="field max-w-xs"
          />
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {nextOptions.map((s) => {
          const archive = s === "archived";
          return (
            <button
              key={s}
              onClick={() => move(s)}
              disabled={pending || (s === "assigned" && !studentId.trim())}
              className={
                archive
                  ? "btn-ghost"
                  : "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition disabled:opacity-50"
              }
              style={
                archive
                  ? undefined
                  : {
                      color: STATUS_HUE[s],
                      borderColor: `${STATUS_HUE[s]}55`,
                      backgroundColor: `${STATUS_HUE[s]}14`,
                    }
              }
            >
              {STATUS_LABELS[s]}
              {!archive && <IconArrowRight width={14} height={14} />}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
