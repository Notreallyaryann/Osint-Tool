import { NextRequest, NextResponse } from "next/server";
import { runGithubIntelligence } from "@/services/github";
import { saveSearch } from "@/lib/saveSearch";

export async function POST(req: NextRequest) {
  const { username } = await req.json();

  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  const results = await runGithubIntelligence(username);
  const search = await saveSearch("github", username, results);

  return NextResponse.json({
    searchId: search.id,
    type: "github",
    query: username,
    results,
    createdAt: search.createdAt,
  });
}
