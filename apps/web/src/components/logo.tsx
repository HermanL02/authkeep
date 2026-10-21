export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-lg bg-emerald-600 text-white">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 1 1 8 0v3" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight">Authkeep</span>
    </div>
  );
}
