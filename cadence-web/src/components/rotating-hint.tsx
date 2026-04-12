"use client";

import { useEffect, useState } from "react";

const HINTS = [
  "Tes athlètes vont enfin voir leur progression.",
  "Fini les programmes sur screenshot.",
  "Le lien coach-athlète, simplifié.",
  "Ton gym dans ta poche. Pour vrai.",
  "Tes athlètes méritent mieux qu\u0027un Google Sheet.",
];

const CYCLE_MS = 4000;
const FADE_MS = 300;

export function RotatingHint() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % HINTS.length);
        setVisible(true);
      }, FADE_MS);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-8 items-center justify-center">
      <p
        className="text-center text-lg italic text-[var(--text-secondary)] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        &laquo;&nbsp;{HINTS[index]}&nbsp;&raquo;
      </p>
    </div>
  );
}
