import { PlatformResult, taken, available, errorResult } from "@/types/result";

export async function checkGitlab(username: string): Promise<PlatformResult> {
  const apiUrl = `https://gitlab.com/api/v4/users?username=${encodeURIComponent(username)}`;
  const profileUrl = `https://gitlab.com/${username}`;

  try {
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return errorResult("GitLab", profileUrl, `HTTP ${res.status}`);

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return taken("GitLab", profileUrl, { id: data[0].id, name: data[0].name });
    }
    return available("GitLab", profileUrl);
  } catch (e) {
    return errorResult("GitLab", profileUrl, (e as Error).message);
  }
}
