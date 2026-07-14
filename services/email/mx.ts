import dns from "node:dns/promises";

export async function checkMx(domain: string) {
  try {
    const records = await dns.resolveMx(domain);
    return {
      hasMx: records.length > 0,
      records: records.sort((a, b) => a.priority - b.priority),
    };
  } catch (e) {
    return { hasMx: false, records: [], error: (e as Error).message };
  }
}
