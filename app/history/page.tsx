import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const searches = await prisma.search
    .findMany({ orderBy: { createdAt: "desc" }, take: 50 })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Search History</h1>

      {searches.length === 0 && (
        <p className="text-sm text-gray-500">No searches yet. Run one from the home page.</p>
      )}

      <ul className="divide-y divide-border border border-border rounded-md">
        {searches.map((s) => (
          <li key={s.id} className="px-4 py-3 flex justify-between items-center text-sm">
            <Link href={`/search?type=${s.type}&q=${encodeURIComponent(s.query)}`} className="hover:text-accent">
              {s.query}
            </Link>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="uppercase">{s.type}</span>
              <span>{new Date(s.createdAt).toLocaleString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
