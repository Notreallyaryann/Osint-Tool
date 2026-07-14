"use client";

import { XonBreachDetails } from "@/services/breach/xon";

const SEVERITY_COLOR: Record<string, { bg: string; text: string; border: string; label: string }> = {
  low:      { bg: "rgba(34,197,94,0.1)",  text: "#4ade80", border: "rgba(34,197,94,0.25)",  label: "Low" },
  medium:   { bg: "rgba(251,191,36,0.1)", text: "#fbbf24", border: "rgba(251,191,36,0.25)", label: "Medium" },
  high:     { bg: "rgba(239,68,68,0.12)", text: "#f87171", border: "rgba(239,68,68,0.3)",   label: "High" },
  critical: { bg: "rgba(220,38,38,0.15)", text: "#ef4444", border: "rgba(220,38,38,0.35)",  label: "Critical" },
};

function getSeverity(risk: string) {
  const r = (risk || "").toLowerCase();
  if (r.includes("critical")) return SEVERITY_COLOR.critical;
  if (r.includes("high"))     return SEVERITY_COLOR.high;
  if (r.includes("medium"))   return SEVERITY_COLOR.medium;
  return SEVERITY_COLOR.low;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "Unknown";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatRecords(n: number) {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function DataTags({ xposedData }: { xposedData: string }) {
  if (!xposedData) return null;
  const tags = xposedData.split(";").map((t) => t.trim()).filter(Boolean).slice(0, 6);
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-medium"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function BreachItem({ breach }: { breach: XonBreachDetails }) {
  const sev = getSeverity(breach.password_risk);
  const logoSrc =
    breach.logo ||
    `https://www.google.com/s2/favicons?domain=${breach.domain || breach.breach}&sz=64`;

  return (
    <div
      className="rounded-lg border p-4 flex gap-3 transition-all duration-200 hover:scale-[1.005]"
      style={{ background: "rgba(255,255,255,0.025)", borderColor: sev.border }}
    >
      {/* Logo */}
      <div
        className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border"
        style={{ background: sev.bg, borderColor: sev.border }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt={breach.breach}
          width={28}
          height={28}
          className="rounded-sm object-contain"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = "none";
            if (el.nextSibling) return;
            const fallback = document.createElement("span");
            fallback.className = "text-lg font-bold";
            fallback.style.color = sev.text;
            fallback.textContent = (breach.breach || "?")[0].toUpperCase();
            el.parentElement?.appendChild(fallback);
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-white leading-tight">{breach.breach}</p>
            {breach.domain && (
              <p className="text-xs text-gray-500 mt-0.5">{breach.domain}</p>
            )}
          </div>
          {/* Severity badge */}
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0"
            style={{ background: sev.bg, color: sev.text, borderColor: sev.border }}
          >
            {sev.label} risk
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          {breach.xposed_date && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(breach.xposed_date)}
            </span>
          )}
          {breach.xposed_records > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {formatRecords(breach.xposed_records)} records
            </span>
          )}
          {breach.industry && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {breach.industry}
            </span>
          )}
        </div>

        {/* Exposed data tags */}
        {breach.xposed_data && <DataTags xposedData={breach.xposed_data} />}
      </div>
    </div>
  );
}

export default function BreachCard({
  breaches,
  breachCount,
  error,
}: {
  breaches: XonBreachDetails[];
  breachCount: number;
  error?: string;
}) {
  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#111623] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1f2937] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: breachCount > 0 ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.1)",
              border: `1px solid ${breachCount > 0 ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.25)"}`,
            }}
          >
            <svg
              className="w-4 h-4"
              style={{ color: breachCount > 0 ? "#f87171" : "#4ade80" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Data Breaches</h3>
            <p className="text-xs text-gray-500">via XposedOrNot</p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
            breachCount > 0
              ? "bg-red-500/10 text-red-400 border-red-500/25"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
          }`}
        >
          {breachCount > 0 ? `${breachCount} breach${breachCount > 1 ? "es" : ""}` : "Clean"}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        {error && (
          <p className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {!error && breachCount === 0 && (
          <div className="flex flex-col items-center py-8 gap-2 text-gray-500">
            <svg className="w-10 h-10 text-emerald-500/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <p className="text-sm font-medium text-emerald-400">No breaches found</p>
            <p className="text-xs text-gray-600">This email wasn&apos;t found in any known data breaches.</p>
          </div>
        )}

        {breaches.length > 0 && (
          <div className="space-y-3">
            {breaches.map((b, i) => (
              <BreachItem key={`${b.breach}-${i}`} breach={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
