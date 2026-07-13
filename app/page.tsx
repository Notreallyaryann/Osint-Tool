import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const recent = await prisma.search
    .findMany({ orderBy: { createdAt: "desc" }, take: 5 })
    .catch(() => []);

  return (
    <div className="space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-widest text-accent">OSINT TOOL</h1>
        <p className="text-sm text-gray-400">Email, domain, and username intelligence — public sources only.</p>
      </div>

      <div className="max-w-md mx-auto">
        <SearchBox />
      </div>

      {recent.length > 0 && (
        <div className="max-w-md mx-auto">
          <h2 className="text-sm text-gray-400 mb-2">Recent Searches</h2>
          <ul className="divide-y divide-border border border-border rounded-md">
            {recent.map((s) => (
              <li key={s.id} className="px-4 py-3 text-sm flex justify-between">
                <Link
                  href={`/search?type=${s.type}&q=${encodeURIComponent(s.query)}`}
                  className="hover:text-accent"
                >
                  {s.query}
                </Link>
                <span className="text-gray-500 uppercase text-xs">{s.type}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
