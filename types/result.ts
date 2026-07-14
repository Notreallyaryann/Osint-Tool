export type UsernameStatus = "taken" | "available" | "error";

export interface PlatformResult {
  platform: string;
  status: UsernameStatus;
  url: string;
  meta?: Record<string, unknown>;
  error?: string;
}

export function taken(
  platform: string,
  url: string,
  meta?: Record<string, unknown>
): PlatformResult {
  return { platform, status: "taken", url, meta };
}

export function available(platform: string, url: string): PlatformResult {
  return { platform, status: "available", url };
}

export function errorResult(
  platform: string,
  url: string,
  message: string
): PlatformResult {
  return { platform, status: "error", url, error: message };
}
