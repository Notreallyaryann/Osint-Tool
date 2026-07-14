"use client";

import { useState } from "react";
import { ServiceCardResult } from "@/types/search";
import FootprintCard from "@/components/FootprintCard";
import BreachCard from "@/components/BreachCard";
import { FootprintResult } from "@/services/email/footprint/types";
import { XonBreachDetails } from "@/services/breach/xon";

// ─── Generic key/value renderer ───────────────────────────────────────────────
function flattenBooleans(data: Record<string, unknown>, prefix = ""): [string, boolean][] {
  const entries: [string, boolean][] = [];
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "boolean") {
      entries.push([prefix ? `${prefix}.${key}` : key, value]);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      entries.push(
        ...flattenBooleans(value as Record<string, unknown>, prefix ? `${prefix}.${key}` : key)
      );
    }
  }
  return entries;
}

// ─── Email result — renders sub-cards per section ────────────────────────────
function EmailResultCard({ result }: { result: ServiceCardResult }) {
  const [expanded, setExpanded] = useState(false);
  const d = result.data as Record<string, any>;

  const footprint = d.footprint as
    | { checked: boolean; footprintCount: number; results: FootprintResult[]; error?: string }
    | undefined;

  const breachData = d.breaches as
    | { checked: boolean; breachCount: number; breaches: XonBreachDetails[]; error?: string }
    | undefined;

  // Everything except footprint + breaches for the generic card
  const genericData = { ...d };
  delete genericData.footprint;
  delete genericData.breaches;
  const boolFlags = flattenBooleans(genericData).slice(0, 10);

  return (
    <div className="space-y-4 w-full">
      {/* ── General email card ── */}
      <div className="rounded-xl border border-[#1f2937] bg-[#111623] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1f2937] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Email Intelligence</h3>
              <p className="text-xs text-gray-500">{result.summary}</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${result.ok ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" : "bg-red-500/10 text-red-400 border-red-500/25"}`}>
            {result.ok ? "OK" : "FAILED"}
          </span>
        </div>
        <div className="px-5 py-4">
          {boolFlags.length > 0 && (
            <ul className="space-y-2 mb-4">
              {boolFlags.map(([key, value]) => (
                <li key={key} className="flex justify-between text-sm text-gray-400">
                  <span className="capitalize">{key.replace(/([A-Z])/g, " $1").replace(/\./g, " › ")}</span>
                  <span>{value ? <span className="text-emerald-400">✔</span> : <span className="text-red-400">✘</span>}</span>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {expanded ? "Hide raw data ↑" : "View raw data ↓"}
          </button>
          {expanded && (
            <pre className="mt-3 text-xs bg-[#0b0e14] border border-[#1f2937] rounded-lg p-4 overflow-x-auto text-gray-400 max-h-64">
              {JSON.stringify(genericData, null, 2)}
            </pre>
          )}
        </div>
      </div>

      {/* ── Footprint card ── */}
      {footprint?.results && footprint.results.length > 0 && (
        <FootprintCard results={footprint.results} />
      )}

      {/* ── Breach card ── */}
      {breachData && (
        <BreachCard
          breaches={(breachData.breaches as XonBreachDetails[]) || []}
          breachCount={breachData.breachCount}
          error={breachData.error}
        />
      )}
    </div>
  );
}

// ─── Generic card fallback ────────────────────────────────────────────────────
function GenericResultCard({ result }: { result: ServiceCardResult }) {
  const [expanded, setExpanded] = useState(false);
  const boolFlags = flattenBooleans(result.data).slice(0, 8);
  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#111623] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1f2937] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{result.source}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{result.summary}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${result.ok ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" : "bg-red-500/10 text-red-400 border-red-500/25"}`}>
          {result.ok ? "OK" : "FAILED"}
        </span>
      </div>
      <div className="px-5 py-4">
        {boolFlags.length > 0 && (
          <ul className="space-y-2 mb-4">
            {boolFlags.map(([key, value]) => (
              <li key={key} className="flex justify-between text-sm text-gray-400">
                <span>{key}</span>
                <span>{value ? <span className="text-emerald-400">✔</span> : <span className="text-red-400">✘</span>}</span>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {expanded ? "Hide details ↑" : "View details ↓"}
        </button>
        {expanded && (
          <pre className="mt-3 text-xs bg-[#0b0e14] border border-[#1f2937] rounded-lg p-4 overflow-x-auto text-gray-400 max-h-64">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ResultCard({ result }: { result: ServiceCardResult }) {
  if (result.source === "email") {
    return <EmailResultCard result={result} />;
  }
  return <GenericResultCard result={result} />;
}
