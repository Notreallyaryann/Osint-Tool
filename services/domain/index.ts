import { getWhois } from "./whois";
import { getSslInfo } from "./ssl";
import { getSecurityHeaders } from "./securityHeaders";
import { getCertTransparency } from "./certTransparency";
import { detectTech } from "./techDetect";
import { getDnsRecords } from "../dns/records";
import { ServiceCardResult } from "@/types/search";

export async function runDomainIntelligence(domain: string): Promise<ServiceCardResult[]> {
  const [whois, dnsRecords, ssl, headers, certTransparency, tech] = await Promise.all([
    getWhois(domain),
    getDnsRecords(domain),
    getSslInfo(domain),
    getSecurityHeaders(domain),
    getCertTransparency(domain),
    detectTech(domain),
  ]);

  return [
    {
      source: "domain",
      ok: true,
      summary: `${tech.signals?.length ?? 0} technologies detected`,
      data: { whois, dns: dnsRecords, ssl, headers, certTransparency, tech },
    },
  ];
}
