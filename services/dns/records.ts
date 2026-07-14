import dns from "node:dns/promises";

export async function getDnsRecords(domain: string) {
  const results: Record<string, unknown> = {};

  const lookups: [string, () => Promise<unknown>][] = [
    ["A", () => dns.resolve4(domain)],
    ["AAAA", () => dns.resolve6(domain)],
    ["MX", () => dns.resolveMx(domain)],
    ["TXT", () => dns.resolveTxt(domain)],
    ["NS", () => dns.resolveNs(domain)],
    ["CNAME", () => dns.resolveCname(domain)],
  ];

  for (const [type, fn] of lookups) {
    try {
      results[type] = await fn();
    } catch (e) {
      results[type] = { error: (e as Error).message };
    }
  }

  return results;
}
