import { PlatformResult, taken, available, errorResult } from "@/types/result";

// Medium has no public API for this; we do a simple GET on the public profile
// page and check the HTTP status. No headers spoofing, no auth bypass.
export async function checkMedium(username: string): Promise<PlatformResult> {
  const profileUrl = `https://medium.com/@${username}`;

  try {
    const res = await fetch(profileUrl, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 404) return available("Medium", profileUrl);
    if (!res.ok) return errorResult("Medium", profileUrl, `HTTP ${res.status}`);

    return taken("Medium", profileUrl);
  } catch (e) {
    return errorResult("Medium", profileUrl, (e as Error).message);
  }
}
