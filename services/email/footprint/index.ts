import { FootprintResult } from "./types";
import { checkInstagram } from "./social/instagram";
import { checkFacebook } from "./social/facebook";
import { checkGithub } from "./social/github";

export type { FootprintResult };

const CHECKS = [
  checkInstagram,
  checkFacebook,
  checkGithub,
];

export async function checkFootprints(email: string): Promise<{
  checked: boolean;
  footprintCount: number;
  results: FootprintResult[];
  error?: string;
}> {
  try {
    const resultsSettled = await Promise.allSettled(CHECKS.map((check) => check(email)));
    const results: FootprintResult[] = [];
    let footprintCount = 0;

    for (const r of resultsSettled) {
      if (r.status === "fulfilled") {
        results.push(r.value);
        if (r.value.status === "taken") {
          footprintCount++;
        }
      } else {
        results.push({
          source: "unknown",
          status: "error",
          url: null,
          message: r.reason instanceof Error ? r.reason.message : "Unknown error",
        });
      }
    }

    return { checked: true, footprintCount, results };
  } catch (e) {
    return { checked: false, footprintCount: 0, results: [], error: (e as Error).message };
  }
}
