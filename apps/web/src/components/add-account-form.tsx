"use client";

import { useState } from "react";

const input =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-stone-700 dark:bg-stone-950";

export function AddAccountForm({ onAdded }: { onAdded: () => void }) {
  const [mode, setMode] = useState<"uri" | "secret">("uri");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body =
      mode === "uri"
        ? { uri: String(form.get("uri")).trim() }
        : {
            label: String(form.get("label")).trim(),
            secret: String(form.get("secret")).trim(),
            ...(form.get("issuer") ? { issuer: String(form.get("issuer")).trim() } : {}),
          };
    setPending(true);
    setError(null);
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setPending(false);
    if (res.ok) return onAdded();
    const { message } = await res.json().catch(() => ({ message: null }));
    setError(Array.isArray(message) ? message.join(", ") : (message ?? "Couldn't add the account."));
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-8 space-y-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="flex gap-1 rounded-lg bg-stone-100 p-1 text-sm dark:bg-stone-800">
        {(["uri", "secret"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-md px-3 py-1.5 ${mode === m ? "bg-white shadow-sm dark:bg-stone-950" : "text-stone-500"}`}
          >
            {m === "uri" ? "otpauth:// link" : "Secret key"}
          </button>
        ))}
      </div>

      {mode === "uri" ? (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">otpauth link</span>
          <input name="uri" required placeholder="otpauth://totp/GitHub:me@example.com?secret=…" className={input} />
          <span className="block text-xs text-stone-500">Scan the QR code with any QR reader to get this link.</span>
        </label>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Account</span>
            <input name="label" required placeholder="me@example.com" className={input} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">
              Issuer <span className="font-normal text-stone-500">(optional)</span>
            </span>
            <input name="issuer" placeholder="GitHub" className={input} />
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Secret key</span>
            <input name="secret" required placeholder="JBSW Y3DP EHPK 3PXP" className={`${input} font-mono`} />
          </label>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add account"}
      </button>
    </form>
  );
}
