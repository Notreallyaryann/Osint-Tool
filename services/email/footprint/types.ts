export interface FootprintResult {
  source: string;
  status: "available" | "taken" | "error";
  url: string | null;
  message: string | null;
  /** Resolved username on the platform (e.g. @johndoe) */
  username?: string;
  /** Full display name (e.g. John Doe) */
  displayName?: string;
  /** Avatar/profile picture URL */
  avatarUrl?: string;
  /** Profile URL linking directly to the user profile */
  profileUrl?: string;
}
