import { NextRequest, NextResponse } from "next/server";
import { getDnsRecords } from "@/services/dns/records";
import { saveSearch } from "@/lib/saveSearch";

export async function POST(req: NextRequest) {
  const { domain } = await req.json();

  if (!domain || typeof domain !== "string") {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  const records = await getDnsRecords(domain);
  const results = [{ source: "dns", ok: true, summary: "DNS records fetched", data: records }];
  const search = await saveSearch("dns", domain, results);

  return NextResponse.json({
    searchId: search.id,
    type: "dns",
    query: domain,
    results,
    createdAt: search.createdAt,
  });
}
