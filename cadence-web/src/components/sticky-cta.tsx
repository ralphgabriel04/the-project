"use client";

import { useEffect, useState } from "react";
import { WaitlistForm } from "./waitlist-form";

export function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]/95 px-4 py-3 backdrop-blur-lg transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      role="complementary"
      aria-label="Inscription rapide"
    >
      <div className="mx-auto flex max-w-lg items-center justify-center">
        <WaitlistForm location="sticky" />
      </div>
    </div>
  );
}
