// Uses RDAP (the modern, structured replacement for WHOIS) — no API key needed.
export async function getWhois(domain: string) {
  try {
    const res = await fetch(`https://rdap.org/domain/${domain}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { available: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return {
      available: true,
      handle: data.handle,
      status: data.status,
      events: data.events,
      nameservers: (data.nameservers ?? []).map((ns: { ldhName: string }) => ns.ldhName),
    };
  } catch (e) {
    return { available: false, error: (e as Error).message };
  }
}
