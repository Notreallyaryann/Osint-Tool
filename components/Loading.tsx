export default function Loading({ label = "Loading results..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-400 py-8">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
