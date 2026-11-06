"use client";

import { useEffect, useRef } from "react";

const LINE = "If an assistant cannot quote you, you are not in the answer.";

export function TaglineReveal() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = ref.current;
    if (!root) return;
    const words = [...root.querySelectorAll("span")];
    if (reduce) {
      words.forEach((w) => w.classList.add("is-on"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          words.forEach((word, i) => {
            window.setTimeout(() => word.classList.add("is-on"), i * 70);
          });
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <section className="mx-auto max-w-[680px] px-6 py-24">
      <p ref={ref} className="heading-3">
        {LINE.split(" ").map((word, i) => (
          <span key={`${word}-${i}`} className="reveal-word">
            {word}{" "}
          </span>
        ))}
      </p>
    </section>
  );
}
