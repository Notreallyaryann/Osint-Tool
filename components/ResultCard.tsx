"use client";

import { useState } from "react";
import { ServiceCardResult } from "@/types/search";

function flattenBooleans(data: Record<string, unknown>, prefix = ""): [string, boolean][] {
  const entries: [string, boolean][] = [];
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "boolean") {
      entries.push([prefix ? `${prefix}.${key}` : key, value]);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      entries.push(...flattenBooleans(value as Record<string, unknown>, prefix ? `${prefix}.${key}` : key));
    }
  }
  return entries;
}

export default function ResultCard({ result }: { result: ServiceCardResult }) {
  const [expanded, setExpanded] = useState(false);
  const booleanFlags = flattenBooleans(result.data).slice(0, 8);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="uppercase text-sm tracking-wider text-accent font-semibold">
          {result.source}
        </h3>
        <span
          className={`text-xs px-2 py-1 rounded ${
            result.ok ? "bg-emerald-900 text-emerald-300" : "bg-red-900 text-red-300"
          }`}
        >
          {result.ok ? "OK" : "FAILED"}
        </span>
      </div>

      <p className="text-sm text-gray-300 mb-3">{result.summary}</p>

      {booleanFlags.length > 0 && (
        <ul className="text-sm space-y-1 mb-3">
          {booleanFlags.map(([key, value]) => (
            <li key={key} className="flex justify-between text-gray-400">
              <span>{key}</span>
              <span>{value ? "✔" : "❌"}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => setExpanded((e) => !e)}
        className="text-xs text-accent hover:underline"
      >
        {expanded ? "Hide details" : "View"}
      </button>

      {expanded && (
        <pre className="mt-3 text-xs bg-background border border-border rounded p-3 overflow-x-auto">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      )}
    </div>
  );
}
