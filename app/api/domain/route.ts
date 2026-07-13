import { NextRequest, NextResponse } from "next/server";
import { runDomainIntelligence } from "@/services/domain";
import { saveSearch } from "@/lib/saveSearch";

export async function POST(req: NextRequest) {
  const { domain } = await req.json();

  if (!domain || typeof domain !== "string") {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  const results = await runDomainIntelligence(domain);
  const search = await saveSearch("domain", domain, results);

  return NextResponse.json({
    searchId: search.id,
    type: "domain",
    query: domain,
    results,
    createdAt: search.createdAt,
  });
}
