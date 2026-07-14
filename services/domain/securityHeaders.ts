const HEADERS_TO_CHECK = [
  "strict-transport-security",
  "content-security-policy",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
];

export async function getSecurityHeaders(domain: string) {
  try {
    const res = await fetch(`https://${domain}`, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    const present: Record<string, string | null> = {};
    for (const h of HEADERS_TO_CHECK) {
      present[h] = res.headers.get(h);
    }

    return { available: true, headers: present };
  } catch (e) {
    return { available: false, error: (e as Error).message };
  }
}
