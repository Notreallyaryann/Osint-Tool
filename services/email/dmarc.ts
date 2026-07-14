import dns from "node:dns/promises";

export async function checkDmarc(domain: string) {
  try {
    const records = await dns.resolveTxt(`_dmarc.${domain}`);
    const flat = records.map((r) => r.join(""));
    const dmarc = flat.find((r) => r.startsWith("v=DMARC1"));
    return { present: !!dmarc, record: dmarc ?? null };
  } catch (e) {
    return { present: false, record: null, error: (e as Error).message };
  }
}
