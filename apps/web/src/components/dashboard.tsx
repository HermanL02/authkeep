"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AddAccountForm } from "./add-account-form";
import { Logo } from "./logo";

type Code = {
  id: string;
  label: string;
  issuer: string | null;
  code: string;
  period: number;
  remainingSeconds: number;
};

type Fetched = { codes: Code[]; at: number };

export function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<Fetched | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/codes", { cache: "no-store" });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) return setError("Couldn't load codes. Is the API running?");
    setError(null);
    setData({ codes: await res.json(), at: Date.now() });
  }, [router]);

  // Latest data for the timer callback, so it can tell when a window rolls over.
  const dataRef = useRef<Fetched | null>(null);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    let inFlight = false;
    const refresh = () => {
      inFlight = true;
      void load().finally(() => (inFlight = false));
    };
    const tick = () => {
      const t = Date.now();
      setNow(t);
      const d = dataRef.current;
      const rolledOver = d?.codes.some((c) => c.remainingSeconds - (t - d.at) / 1000 <= 0);
      if (rolledOver && !inFlight) refresh();
    };
    const first = setTimeout(refresh, 0);
    const timer = setInterval(tick, 250);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [load]);

  const elapsed = data && now > data.at ? Math.floor((now - data.at) / 1000) : 0;

  async function logout() {
    await fetch("/api/session", { method: "DELETE" });
    router.replace("/login");
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
      <header className="mb-8 flex items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdding((v) => !v)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            {adding ? "Close" : "Add account"}
          </button>
          <button
            onClick={logout}
            className="rounded-lg px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-200/60 dark:hover:bg-stone-800"
          >
            Sign out
          </button>
        </div>
      </header>

      {adding && (
        <AddAccountForm
          onAdded={() => {
            setAdding(false);
            void load();
          }}
        />
      )}

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}

      {!data ? (
        <p className="text-sm text-stone-500">Loading codes…</p>
      ) : data.codes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center dark:border-stone-700">
          <p className="font-medium">No accounts yet</p>
          <p className="mt-1 text-sm text-stone-500">Add one with an otpauth:// link or a secret key.</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.codes.map((c) => (
            <CodeCard key={c.id} code={c} remaining={Math.max(0, c.remainingSeconds - elapsed)} onDeleted={load} />
          ))}
        </ul>
      )}
    </main>
  );
}

function CodeCard({ code, remaining, onDeleted }: { code: Code; remaining: number; onDeleted: () => void }) {
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const pct = (remaining / code.period) * 100;
  const urgent = remaining <= 5;
  const pretty = code.code.length === 6 ? `${code.code.slice(0, 3)} ${code.code.slice(3)}` : code.code;

  async function copy() {
    await navigator.clipboard.writeText(code.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  async function remove() {
    await fetch(`/api/accounts/${code.id}`, { method: "DELETE" });
    onDeleted();
  }

  return (
    <li className="group rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-h-9 min-w-0">
          <p className="truncate text-sm font-medium">{code.issuer ?? code.label}</p>
          {code.issuer && <p className="truncate text-xs text-stone-500">{code.label}</p>}
        </div>
        {confirming ? (
          <div className="flex gap-1 text-xs">
            <button onClick={remove} className="rounded px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
              Delete
            </button>
            <button onClick={() => setConfirming(false)} className="rounded px-2 py-1 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800">
              Keep
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${code.label}`}
            className="rounded px-2 py-1 text-xs text-stone-400 opacity-0 hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
          >
            Remove
          </button>
        )}
      </div>
      <button onClick={copy} className="mt-3 flex w-full items-end justify-between text-left" title="Copy code">
        <span className={`font-mono text-3xl font-semibold tracking-wider tabular-nums ${urgent ? "text-red-600" : ""}`}>
          {copied ? "Copied" : pretty}
        </span>
        <span className="text-xs tabular-nums text-stone-500">{remaining}s</span>
      </button>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
        <div
          className={`h-full transition-[width] duration-300 ease-linear ${urgent ? "bg-red-500" : "bg-emerald-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}
