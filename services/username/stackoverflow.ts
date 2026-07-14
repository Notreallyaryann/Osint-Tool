import { PlatformResult, taken, available, errorResult } from "@/types/result";

// StackOverflow doesn't support username lookup directly via public API without
// a display-name search, so this checks the public user search endpoint.
export async function checkStackOverflow(username: string): Promise<PlatformResult> {
  const apiUrl = `https://api.stackexchange.com/2.3/users?order=desc&sort=reputation&inname=${encodeURIComponent(
    username
  )}&site=stackoverflow`;
  const profileUrl = `https://stackoverflow.com/users?tab=Reputation&filter=all&search=${encodeURIComponent(
    username
  )}`;

  try {
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return errorResult("StackOverflow", profileUrl, `HTTP ${res.status}`);

    const data = await res.json();
    if (Array.isArray(data.items) && data.items.length > 0) {
      const user = data.items[0];
      return taken("StackOverflow", user.link ?? profileUrl, {
        reputation: user.reputation,
        display_name: user.display_name,
      });
    }
    return available("StackOverflow", profileUrl);
  } catch (e) {
    return errorResult("StackOverflow", profileUrl, (e as Error).message);
  }
}
