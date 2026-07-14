import { PlatformResult, taken, available, errorResult } from "@/types/result";

export async function checkGithub(username: string): Promise<PlatformResult> {
  const apiUrl = `https://api.github.com/users/${encodeURIComponent(username)}`;
  const profileUrl = `https://github.com/${username}`;

  try {
    const res = await fetch(apiUrl, {
      headers: { "User-Agent": "osint-tool" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 404) return available("GitHub", profileUrl);
    if (res.status === 403) return errorResult("GitHub", profileUrl, "Rate limited (403)");
    if (!res.ok) return errorResult("GitHub", profileUrl, `HTTP ${res.status}`);

    const data = await res.json();
    return taken("GitHub", profileUrl, {
      followers: data.followers,
      public_repos: data.public_repos,
      created_at: data.created_at,
      bio: data.bio,
    });
  } catch (e) {
    return errorResult("GitHub", profileUrl, (e as Error).message);
  }
}
