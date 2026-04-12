import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
          {/* Brand */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
              CADENCE
            </span>
            <span className="text-sm text-[var(--text-muted)]">
              Le coaching sportif, repensé pour ici.
            </span>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com/cadence.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--accent)]"
              aria-label="Instagram"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://linkedin.com/company/cadence-app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--accent)]"
              aria-label="LinkedIn"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-4 border-t border-[var(--border-subtle)] pt-8 text-sm text-[var(--text-muted)] md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <span>&copy; {currentYear} Cadence. Tous droits réservés.</span>
            <span className="text-xs">Montréal, Québec, Canada</span>
          </div>
          <Link
            href="/privacy"
            className="transition-colors duration-200 hover:text-[var(--accent)]"
          >
            Politique de confidentialité
          </Link>
        </div>
      </div>
    </footer>
  );
}
