import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Returns a combined report for a given searchId (used by the History/Report page).
export async function GET(req: NextRequest) {
  const searchId = req.nextUrl.searchParams.get("searchId");

  if (!searchId) {
    return NextResponse.json({ error: "searchId is required" }, { status: 400 });
  }

  const search = await prisma.search.findUnique({
    where: { id: searchId },
    include: { results: true },
  });

  if (!search) {
    return NextResponse.json({ error: "Search not found" }, { status: 404 });
  }

  return NextResponse.json(search);
}
