import { ContactForm } from "@/components/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a free AEO consultation",
  description: "Send the URL you checked and a short note. First conversation is free.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="heading-3">Book a free AEO consultation</h1>
      <p className="body-3 mt-4 max-w-[680px] text-muted">
        Tell us the site, the market, and what Gemini already gets wrong. We reply with next steps. No charge for the first conversation.
      </p>
      <div className="mt-10">
        <ContactForm />
      </div>
    </article>
  );
}
