// Lightweight domain-age check via RDAP (no API key required, unlike most WHOIS
// providers). Falls back gracefully if RDAP has no data for the TLD.
export async function checkDomainAge(domain: string) {
  try {
    const res = await fetch(`https://rdap.org/domain/${domain}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { available: false, error: `HTTP ${res.status}` };

    const data = await res.json();
    const registration = (data.events ?? []).find(
      (e: { eventAction: string }) => e.eventAction === "registration"
    );

    if (!registration) return { available: false, error: "No registration event found" };

    const registeredAt = new Date(registration.eventDate);
    const ageDays = Math.floor((Date.now() - registeredAt.getTime()) / 86_400_000);

    return { available: true, registeredAt: registeredAt.toISOString(), ageDays };
  } catch (e) {
    return { available: false, error: (e as Error).message };
  }
}
