"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconMark, IconArrowRight } from "@/components/icons";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(params.get("from") || "/pipeline");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-[400px] animate-fade-up">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-acid text-ink shadow-glow">
            <IconMark width={20} height={20} />
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold tracking-tight text-fog">Systems 10</div>
            <div className="kicker">Outbound Console</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="panel space-y-5 p-7">
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight text-fog">Sign in</h1>
            <p className="mt-1 text-sm text-muted">Access the acquisition pipeline.</p>
          </div>

          <label className="block">
            <span className="kicker mb-1.5 block">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="you@systems10.com"
              className="field"
            />
          </label>

          <label className="block">
            <span className="kicker mb-1.5 block">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="field"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in…" : "Sign in"}
            {!loading && <IconArrowRight width={16} height={16} />}
          </button>
        </form>

        <p className="mt-5 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          Sourced → Enriched → Sequenced → Closed
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
