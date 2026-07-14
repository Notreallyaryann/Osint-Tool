import { PlatformResult } from "@/types/result";
import { checkGithub } from "./github";
import { checkGitlab } from "./gitlab";
import { checkReddit } from "./reddit";
import { checkStackOverflow } from "./stackoverflow";
import { checkMedium } from "./medium";

// Simple sequential-with-concurrency-cap runner to be a polite citizen of
// these public APIs rather than firing everything at once.
export async function checkAllPlatforms(username: string): Promise<PlatformResult[]> {
  const checks = [
    checkGithub,
    checkGitlab,
    checkReddit,
    checkStackOverflow,
    checkMedium,
  ];

  const results: PlatformResult[] = [];
  for (const check of checks) {
    results.push(await check(username));
    await new Promise((r) => setTimeout(r, 250)); // light rate-limit spacing
  }
  return results;
}
