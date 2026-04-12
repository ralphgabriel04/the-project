export function Navbar() {
  return (
    <nav className="animate-fade-in sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 px-6 py-4 backdrop-blur-lg">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {/* Logo wordmark */}
        <a
          href="/"
          className="text-xl font-extrabold tracking-tight text-[var(--text-primary)] transition-opacity duration-200 hover:opacity-80"
        >
          CADENCE
        </a>

        {/* Status badge */}
        <div className="flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-sm">
          <span
            className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]"
            aria-hidden="true"
          />
          <span className="font-medium text-[var(--accent)]">Bientôt</span>
        </div>
      </div>
    </nav>
  );
}
