// crt.sh public certificate transparency log search — no API key required.
export async function getCertTransparency(domain: string) {
  try {
    const res = await fetch(`https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { available: false, error: `HTTP ${res.status}` };

    const data = await res.json();
    const names = new Set<string>(
      (data as { name_value: string }[]).flatMap((entry) => entry.name_value.split("\n"))
    );

    return { available: true, count: names.size, subdomains: Array.from(names).slice(0, 50) };
  } catch (e) {
    return { available: false, error: (e as Error).message };
  }
}
