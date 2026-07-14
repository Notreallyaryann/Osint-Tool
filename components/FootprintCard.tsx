"use client";

import { FootprintResult } from "@/services/email/footprint/types";

// ─── Platform brand config ────────────────────────────────────────────────────
const PLATFORM_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  instagram: {
    label: "Instagram",
    color: "#E1306C",
    bg: "rgba(225,48,108,0.12)",
    icon: "https://www.google.com/s2/favicons?domain=instagram.com&sz=64",
  },
  facebook: {
    label: "Facebook",
    color: "#1877F2",
    bg: "rgba(24,119,242,0.12)",
    icon: "https://www.google.com/s2/favicons?domain=facebook.com&sz=64",
  },
  github: {
    label: "GitHub",
    color: "#f0f6fc",
    bg: "rgba(240,246,252,0.08)",
    icon: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
  },
  twitter: {
    label: "Twitter / X",
    color: "#1DA1F2",
    bg: "rgba(29,161,242,0.12)",
    icon: "https://www.google.com/s2/favicons?domain=x.com&sz=64",
  },
  linkedin: {
    label: "LinkedIn",
    color: "#0A66C2",
    bg: "rgba(10,102,194,0.12)",
    icon: "https://www.google.com/s2/favicons?domain=linkedin.com&sz=64",
  },
};

function getPlatformConfig(source: string) {
  return (
    PLATFORM_CONFIG[source.toLowerCase()] ?? {
      label: source.charAt(0).toUpperCase() + source.slice(1),
      color: "#22d3ee",
      bg: "rgba(34,211,238,0.10)",
      icon: `https://www.google.com/s2/favicons?domain=${source}.com&sz=64`,
    }
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "taken") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Found
      </span>
    );
  }
  if (status === "available") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-600/40">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
        Not found
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
      Error
    </span>
  );
}

function PlatformRow({ r }: { r: FootprintResult }) {
  const cfg = getPlatformConfig(r.source);
  const hasProfile = r.status === "taken" && (r.profileUrl || r.url);
  const target = r.profileUrl || r.url || undefined;

  return (
    <a
      href={hasProfile ? target : undefined}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-3 rounded-xl border transition-all duration-200 overflow-hidden ${
        r.status === "taken"
          ? "hover:scale-[1.01] cursor-pointer"
          : "opacity-55"
      }`}
      style={{
        background: r.status === "taken" ? cfg.bg : "rgba(255,255,255,0.015)",
        borderColor: r.status === "taken" ? `${cfg.color}35` : "rgba(255,255,255,0.06)",
        padding: r.avatarUrl ? "0" : "12px 16px",
      }}
    >
      {/* Avatar (if found) */}
      {r.avatarUrl && r.status === "taken" && (
        <div className="w-14 h-14 flex-shrink-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={r.avatarUrl}
            alt="avatar"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}

      {/* Inner content with padding */}
      <div
        className="flex flex-1 items-center gap-3"
        style={{ padding: r.avatarUrl ? "10px 12px 10px 0" : "0" }}
      >
        {/* Platform logo (only show if found) */}
        {r.status === "taken" && (
          <div
            className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
            style={{
              background: cfg.bg,
              border: `1px solid ${cfg.color}25`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cfg.icon}
              alt={cfg.label}
              width={24}
              height={24}
              className="rounded-sm"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}

        {/* Name + identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-sm font-semibold leading-tight"
              style={{ color: r.status === "taken" ? cfg.color : "#9ca3af" }}
            >
              {cfg.label}
            </p>
            {/* Username chip */}
            {r.username && (
              <span
                className="text-xs px-2 py-0.5 rounded-md font-mono font-medium"
                style={{
                  background: `${cfg.color}18`,
                  color: cfg.color,
                  border: `1px solid ${cfg.color}30`,
                }}
              >
                @{r.username}
              </span>
            )}
          </div>
          {/* Display name */}
          {r.displayName && (
            <p className="text-xs text-gray-300 mt-0.5 font-medium">{r.displayName}</p>
          )}
          {/* Error message */}
          {r.status === "error" && r.message && (
            <p className="text-xs text-yellow-500/70 truncate mt-0.5">{r.message}</p>
          )}
        </div>

        <StatusBadge status={r.status} />

        {/* External link arrow */}
        {hasProfile && (
          <svg
            className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-300 transition-colors flex-shrink-0 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        )}
      </div>
    </a>
  );
}

export default function FootprintCard({
  results,
}: {
  results: FootprintResult[];
}) {
  const taken = results.filter((r) => r.status === "taken");
  const errors = results.filter((r) => r.status === "error");

  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#111623] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1f2937] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Digital Footprint</h3>
            <p className="text-xs text-gray-500">Social & platform presence</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {taken.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              {taken.length} found
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/10">
            {results.length} checked
          </span>
        </div>
      </div>

      {/* Platform list */}
      <div className="p-4 space-y-2.5">
        {results.map((r) => (
          <PlatformRow key={r.source} r={r} />
        ))}
      </div>

      {errors.length > 0 && (
        <div className="px-5 pb-4">
          <p className="text-xs text-yellow-500/60">
            {errors.length} platform(s) returned errors — may be rate limited or blocked.
          </p>
        </div>
      )}
    </div>
  );
}
