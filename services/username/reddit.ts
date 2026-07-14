import { PlatformResult, taken, available, errorResult } from "@/types/result";

export async function checkReddit(username: string): Promise<PlatformResult> {
  const apiUrl = `https://www.reddit.com/user/${encodeURIComponent(username)}/about.json`;
  const profileUrl = `https://reddit.com/user/${username}`;

  try {
    const res = await fetch(apiUrl, {
      headers: { "User-Agent": "osint-tool/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 404) return available("Reddit", profileUrl);
    if (!res.ok) return errorResult("Reddit", profileUrl, `HTTP ${res.status}`);

    const data = await res.json();
    const name = data?.data?.name;
    if (!name) return available("Reddit", profileUrl);

    return taken("Reddit", profileUrl, {
      total_karma: data.data.total_karma,
      created_utc: data.data.created_utc,
      is_gold: data.data.is_gold,
    });
  } catch (e) {
    return errorResult("Reddit", profileUrl, (e as Error).message);
  }
}
