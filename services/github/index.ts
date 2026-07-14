import { getGithubProfile, getGithubLanguages } from "./profile";
import { ServiceCardResult } from "@/types/search";

export async function runGithubIntelligence(username: string): Promise<ServiceCardResult[]> {
  const [profile, languages] = await Promise.all([
    getGithubProfile(username),
    getGithubLanguages(username),
  ]);

  return [
    {
      source: "github",
      ok: profile.found === true,
      summary: profile.found ? `${profile.followers} followers · ${profile.publicRepos} repos` : "Not found",
      data: { profile, languages },
    },
  ];
}
