import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center gap-4">
        <img
          src="/logo.png"
          alt="Under The Tree"
          className="h-16 w-16 object-contain"
          style={{ mixBlendMode: "multiply" }}
        />
        <div>
          <h1 className="text-3xl font-serif font-bold text-utt-green tracking-wide">
            Under The Tree
          </h1>
          <p className="text-sm italic text-gray-600">
            Result Cum Certificate System
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Link
          href="/admin"
          className="block rounded-md border border-utt-gold/50 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="font-serif text-lg font-semibold text-utt-green">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Import the student registry, upload marks, generate certificates,
            and download as ZIP.
          </p>
          <p className="mt-4 text-xs text-utt-gold">Login required &rarr;</p>
        </Link>

        <div className="block rounded-md border border-utt-gold/50 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-utt-green">
            Verify a Certificate
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Each certificate carries an ID like{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
              UTT-2025-C5-A7X92K
            </code>
            . Visit{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
              /verify/&#123;certificate_id&#125;
            </code>{" "}
            to confirm authenticity.
          </p>
        </div>
      </div>

      <footer className="mt-16 text-center text-xs text-gray-500">
        &copy; Under The Tree
      </footer>
    </main>
  );
}
