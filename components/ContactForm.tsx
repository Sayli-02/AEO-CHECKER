"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Name, email, and a message are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, url, message }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "The message could not be sent.");
        return;
      }
      setDone(true);
    } catch {
      setError("The message could not be sent. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return <p className="body-3">Message received. We will reply to {email} about the consult.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <label className="block">
        <span className="caption-4 text-muted">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="body-3 mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2"
          required
        />
      </label>
      <label className="block">
        <span className="caption-4 text-muted">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="body-3 mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2"
          required
        />
      </label>
      <label className="block">
        <span className="caption-4 text-muted">Site URL optional</span>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="body-3 mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="caption-4 text-muted">What do you want to fix?</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="body-3 mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2"
          required
        />
      </label>
      {error ? <p className="body-5 text-fail">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="button-md rounded-lg bg-accent px-3 py-2 text-accent-text disabled:opacity-50"
      >
        {pending ? "Sending" : "Request a consult"}
      </button>
    </form>
  );
}
