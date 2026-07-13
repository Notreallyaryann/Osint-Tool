"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPES = [
  { value: "email", label: "Email" },
  { value: "domain", label: "Domain" },
  { value: "username", label: "Username" },
  { value: "ip", label: "IP" },
] as const;

export default function SearchBox() {
  const [type, setType] = useState<(typeof TYPES)[number]["value"]>("email");
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?type=${type}&q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-6">
        {TYPES.map((t) => (
          <label key={t.value} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="type"
              value={t.value}
              checked={type === t.value}
              onChange={() => setType(t.value)}
              className="accent-accent"
            />
            {t.label}
          </label>
        ))}
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Enter ${type}...`}
        className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
      />

      <button
        type="submit"
        className="w-full rounded-md bg-accent text-background font-semibold py-3 hover:opacity-90 transition"
      >
        Search
      </button>
    </form>
  );
}
