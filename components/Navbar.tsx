import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold tracking-widest text-accent">
          OSINT TOOL
        </Link>
        <div className="flex gap-6 text-sm text-gray-300">
          <Link href="/search">Search</Link>
          <Link href="/history">History</Link>
        </div>
      </div>
    </nav>
  );
}
