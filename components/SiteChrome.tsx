"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconClose, IconMenu } from "./Icons";

const LINKS = [
  { href: "/aeo-checker", label: "Checker" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Book a consult" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print sticky top-4 z-40 flex justify-center px-3">
      <nav
        aria-label="Primary"
        className="flex items-center gap-3 rounded-full border border-line bg-surface/80 px-4 py-2 backdrop-blur-md"
      >
        <Link href="/" className="title-4 text-foreground">
          AEO Checker
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => {
            const current = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`caption-4 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  current ? "text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          className="md:hidden text-foreground"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </nav>
      {open ? (
        <div
          id="mobile-nav"
          className="fixed inset-0 z-50 flex flex-col bg-background/95 px-6 pt-16 backdrop-blur-md md:hidden"
        >
          <button
            type="button"
            className="mb-8 self-end text-foreground"
            onClick={() => setOpen(false)}
          >
            <IconClose className="h-6 w-6" />
            <span className="sr-only">Close menu</span>
          </button>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="heading-5 py-3 text-foreground"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="no-print mt-24 border border-line bg-surface px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="title-3">AEO Checker</p>
          <p className="body-6 mt-2 max-w-md text-muted">
            A free on page audit for teams who want ChatGPT and Gemini to mention them by name.
          </p>
        </div>
        <div className="flex flex-wrap gap-6">
          <Link href="/about" className="caption-4 text-muted hover:text-foreground">
            About
          </Link>
          <Link href="/contact" className="caption-4 text-muted hover:text-foreground">
            Contact
          </Link>
          <Link href="/privacy" className="caption-4 text-muted hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="caption-4 text-muted hover:text-foreground">
            Terms
          </Link>
          <Link href="/llms.txt" className="caption-4 text-muted hover:text-foreground">
            llms.txt
          </Link>
        </div>
      </div>
    </footer>
  );
}
