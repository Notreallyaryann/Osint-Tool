import dns from "node:dns/promises";

export async function checkSpf(domain: string) {
  try {
    const records = await dns.resolveTxt(domain);
    const flat = records.map((r) => r.join(""));
    const spf = flat.find((r) => r.startsWith("v=spf1"));
    return { present: !!spf, record: spf ?? null };
  } catch (e) {
    return { present: false, record: null, error: (e as Error).message };
  }
}
