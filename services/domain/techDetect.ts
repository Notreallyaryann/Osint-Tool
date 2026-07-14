// Very lightweight tech-fingerprinting from response headers + HTML signatures.
// For production-grade detection, swap in a maintained fingerprint DB (e.g. Wappalyzer's).
export async function detectTech(domain: string) {
  try {
    const res = await fetch(`https://${domain}`, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    const server = res.headers.get("server");
    const poweredBy = res.headers.get("x-powered-by");

    const signals: string[] = [];
    if (/next\.js|_next\//i.test(html)) signals.push("Next.js");
    if (/wp-content|wordpress/i.test(html)) signals.push("WordPress");
    if (/react/i.test(html)) signals.push("React");
    if (/tailwind/i.test(html)) signals.push("Tailwind CSS");
    if (/shopify/i.test(html)) signals.push("Shopify");

    return { available: true, server, poweredBy, signals };
  } catch (e) {
    return { available: false, error: (e as Error).message };
  }
}
