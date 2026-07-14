import { XposedOrNot } from "xposedornot";

export interface XonBreachDetails {
  breach: string;
  details: string;
  domain: string;
  industry: string;
  logo: string;
  password_risk: string;
  searchable: string;
  verified: string;
  xposed_data: string;
  xposed_date: string;
  xposed_records: number;
}

export async function checkXon(email: string): Promise<{
  checked: boolean;
  breachCount: number;
  breaches: XonBreachDetails[] | string[];
  metrics?: any;
  error?: string;
}> {
  try {
    // We can use the breach-analytics endpoint to get rich data
    const url = `https://api.xposedornot.com/v1/breach-analytics?email=${encodeURIComponent(
      email
    )}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "osint-tool",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (res.status === 429) {
      return { checked: false, breachCount: 0, breaches: [], error: "Rate limited by XON (429)" };
    }
    
    if (!res.ok) {
      // Note: XON sometimes returns 404 for not found, but it usually returns 200 with an Error object
      if (res.status === 404) {
          return { checked: true, breachCount: 0, breaches: [] };
      }
      return { checked: false, breachCount: 0, breaches: [], error: `HTTP ${res.status}` };
    }

    const data = await res.json();

    // Not found case according to docs: "BreachesSummary": {"site": ""} and "ExposedBreaches": null
    if (
      !data.ExposedBreaches ||
      (data.BreachesSummary && data.BreachesSummary.site === "") ||
      data.Error === "Not found"
    ) {
      return { checked: true, breachCount: 0, breaches: [] };
    }

    const breachesDetails: XonBreachDetails[] =
      data.ExposedBreaches?.breaches_details || [];
    
    return { 
        checked: true, 
        breachCount: breachesDetails.length, 
        breaches: breachesDetails,
        metrics: data.BreachMetrics
    };
  } catch (e) {
    return { checked: false, breachCount: 0, breaches: [], error: (e as Error).message };
  }
}
