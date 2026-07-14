export type SearchType = "email" | "domain" | "username" | "ip";

export interface SearchRequest {
  type: SearchType;
  query: string;
}

export interface ServiceCardResult {
  source: string;
  ok: boolean;
  summary: string;
  data: Record<string, unknown>;
}

export interface AggregatedSearchResult {
  searchId: string;
  type: SearchType;
  query: string;
  results: ServiceCardResult[];
  createdAt: string;
}
