import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 px-6 py-6">
      <div className="mx-auto text-center text-sm text-[var(--text-muted)]">
        &copy; {currentYear} Cadence · Montréal, Québec, Canada ·{" "}
        <Link
          href="/privacy"
          className="transition-colors duration-200 hover:text-[var(--accent)]"
        >
          Politique de confidentialité
        </Link>
      </div>
    </footer>
  );
}
