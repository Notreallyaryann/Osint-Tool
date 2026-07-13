import { prisma } from "@/lib/prisma";
import { ServiceCardResult } from "@/types/search";

export async function saveSearch(
  type: string,
  query: string,
  results: ServiceCardResult[]
) {
  const search = await prisma.search.create({
    data: {
      type,
      query,
      results: {
        create: results.map((r) => ({
          source: r.source,
          data: r.data as object,
        })),
      },
    },
    include: { results: true },
  });

  return search;
}
