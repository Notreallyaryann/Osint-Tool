export async function getGithubProfile(username: string) {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { "User-Agent": "osint-tool" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 404) return { found: false };
    if (!res.ok) return { found: false, error: `HTTP ${res.status}` };

    const data = await res.json();
    return {
      found: true,
      username: data.login,
      name: data.name,
      followers: data.followers,
      following: data.following,
      publicRepos: data.public_repos,
      createdAt: data.created_at,
      bio: data.bio,
      blog: data.blog,
      location: data.location,
    };
  } catch (e) {
    return { found: false, error: (e as Error).message };
  }
}

export async function getGithubLanguages(username: string) {
  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100`,
      { headers: { "User-Agent": "osint-tool" }, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return { available: false, error: `HTTP ${res.status}` };

    const repos = await res.json();
    const langCounts: Record<string, number> = {};
    for (const repo of repos) {
      if (repo.language) langCounts[repo.language] = (langCounts[repo.language] ?? 0) + 1;
    }

    return { available: true, languages: langCounts };
  } catch (e) {
    return { available: false, error: (e as Error).message };
  }
}
