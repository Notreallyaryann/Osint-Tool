import { NextRequest, NextResponse } from "next/server";
import { checkAllPlatforms } from "@/services/username";
import { saveSearch } from "@/lib/saveSearch";
import { ServiceCardResult } from "@/types/search";

export async function POST(req: NextRequest) {
  const { username } = await req.json();

  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  const platformResults = await checkAllPlatforms(username);

  const results: ServiceCardResult[] = platformResults.map((r) => ({
    source: r.platform.toLowerCase(),
    ok: r.status !== "error",
    summary: r.status,
    data: { ...r },
  }));

  const search = await saveSearch("username", username, results);

  return NextResponse.json({
    searchId: search.id,
    type: "username",
    query: username,
    results,
    createdAt: search.createdAt,
  });
}
