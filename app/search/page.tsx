"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ResultCard from "@/components/ResultCard";
import Loading from "@/components/Loading";
import { ServiceCardResult } from "@/types/search";

const ENDPOINTS: Record<string, { url: string; body: (q: string) => object }> = {
  email: { url: "/api/email", body: (q) => ({ email: q }) },
  domain: { url: "/api/domain", body: (q) => ({ domain: q }) },
  username: { url: "/api/username", body: (q) => ({ username: q }) },
  ip: { url: "/api/domain", body: (q) => ({ domain: q }) }, // MVP: IP routed through domain checks
};

export default function SearchPage() {
  const params = useSearchParams();
  const type = params.get("type") ?? "email";
  const query = params.get("q") ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ServiceCardResult[]>([]);

  useEffect(() => {
    if (!query) return;
    const endpoint = ENDPOINTS[type] ?? ENDPOINTS.email;

    setLoading(true);
    setError(null);

    fetch(endpoint.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(endpoint.body(query)),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
        return res.json();
      })
      .then((data) => setResults(data.results ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [type, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">
          Results for <span className="text-accent">{query}</span>
        </h1>
        <p className="text-xs text-gray-500 uppercase">{type}</p>
      </div>

      {loading && <Loading />}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((r, i) => (
            <ResultCard key={`${r.source}-${i}`} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}
