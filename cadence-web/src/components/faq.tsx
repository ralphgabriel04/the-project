const faqs = [
  {
    question: "C'est quoi Cadence exactement ?",
    answer:
      "Une app mobile qui permet aux coachs de créer des programmes, suivre leurs athlètes en temps réel, et mesurer la compliance et la readiness. Tout en français.",
  },
  {
    question: "Ça va coûter combien ?",
    answer:
      "On annonce les prix au lancement. Les inscrits sur la waitlist auront un tarif fondateur exclusif.",
  },
  {
    question: "Quand est-ce que ça sort ?",
    answer:
      "Beta prévue automne 2026. Les premiers sur la liste seront invités en priorité.",
  },
];

export function FAQ() {
  return (
    <section className="bg-noise relative px-6 py-20">
      <div className="relative z-10 mx-auto max-w-2xl">
        <h2 className="mb-10 text-center text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
          Questions fréquentes
        </h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 transition-colors open:bg-[var(--bg-secondary)]"
            >
              <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left font-medium text-[var(--text-primary)] [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>
                <svg
                  className="h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform duration-200 group-open:rotate-45"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-[var(--text-secondary)] leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
