export interface FootprintResult {
  source: string;
  status: "available" | "taken" | "error";
  url: string | null;
  message: string | null;
}
