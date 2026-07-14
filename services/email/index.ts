import { checkSyntax } from "./syntax";
import { checkMx } from "./mx";
import { checkSpf } from "./spf";
import { checkDmarc } from "./dmarc";
import { checkDisposable } from "./disposable";
import { checkGravatar } from "./gravatar";
import { checkDomainAge } from "./domainAge";
import { checkXon } from "../breach/xon";
import { checkFootprints } from "./footprint";
import { ServiceCardResult } from "@/types/search";

export async function runEmailIntelligence(email: string): Promise<ServiceCardResult[]> {
  const syntax = checkSyntax(email);
  const domain = syntax.domain;

  if (!syntax.valid || !domain) {
    return [
      {
        source: "email",
        ok: false,
        summary: "Invalid email syntax",
        data: { syntax },
      },
    ];
  }

  const [mx, spf, dmarc, disposable, gravatar, domainAge, breaches, footprint] = await Promise.all([
    checkMx(domain),
    checkSpf(domain),
    checkDmarc(domain),
    Promise.resolve(checkDisposable(domain)),
    checkGravatar(email),
    checkDomainAge(domain),
    checkXon(email),
    checkFootprints(email),
  ]);

  return [
    {
      source: "email",
      ok: true,
      summary: `${mx.hasMx ? "Valid MX" : "No MX"} · ${breaches.breachCount} breach(es) · ${footprint.footprintCount} footprint(s)`,
      data: { syntax, mx, spf, dmarc, disposable, gravatar, domainAge, breaches, footprint },
    },
  ];
}
