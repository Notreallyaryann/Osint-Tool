import { NextRequest, NextResponse } from "next/server";
import { runDomainIntelligence } from "@/services/domain";
import { saveSearch } from "@/lib/saveSearch";

export async function POST(req: NextRequest) {
  const { domain } = await req.json();

  if (!domain || typeof domain !== "string") {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  let cleanDomain = domain.trim();
  if (cleanDomain.startsWith("http://") || cleanDomain.startsWith("https://")) {
    try {
      const url = new URL(cleanDomain);
      cleanDomain = url.hostname;
    } catch {
      // fallback
    }
  } else {
    // try to remove paths if any
    cleanDomain = cleanDomain.split('/')[0];
  }

  const results = await runDomainIntelligence(cleanDomain);
  const search = await saveSearch("domain", cleanDomain, results);

  return NextResponse.json({
    searchId: search.id,
    type: "domain",
    query: cleanDomain,
    results,
    createdAt: search.createdAt,
  });
}
