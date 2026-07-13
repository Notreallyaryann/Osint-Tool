import { NextRequest, NextResponse } from "next/server";
import { runEmailIntelligence } from "@/services/email";
import { saveSearch } from "@/lib/saveSearch";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const results = await runEmailIntelligence(email);
  const search = await saveSearch("email", email, results);

  return NextResponse.json({
    searchId: search.id,
    type: "email",
    query: email,
    results,
    createdAt: search.createdAt,
  });
}
