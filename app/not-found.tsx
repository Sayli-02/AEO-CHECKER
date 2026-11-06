import Link from "next/link";

export default function NotFound() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="heading-3">That page is not here</h1>
      <p className="body-3 mt-4 text-muted">The URL does not match a page on AEO Checker. Head home or run a new scan.</p>
      <Link href="/aeo-checker" className="button-md mt-6 inline-flex rounded-lg bg-accent px-3 py-2 text-accent-text">
        Open the checker
      </Link>
    </article>
  );
}
