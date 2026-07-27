import { RISK_META } from "@/lib/health/engine";
import type { RiskLevel } from "@/lib/health/types";

export function RiskBadge({ level, size = "md" }: { level: RiskLevel; size?: "sm" | "md" }) {
  const meta = RISK_META[level];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-semibold ${meta.className} ${
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3.5 py-1.5 text-sm"
      }`}
    >
      <span className="size-2 rounded-full bg-current" aria-hidden="true" />
      {meta.label} risk
    </span>
  );
}
