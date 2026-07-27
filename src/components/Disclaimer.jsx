import { ShieldAlert } from "lucide-react";
const DISCLAIMER_TEXT = "This application provides informational and educational guidance only. It is not a medical diagnosis and should not replace consultation with a qualified healthcare professional. If you have severe or worsening symptoms, seek medical care immediately.";
function Disclaimer({ compact = false }) {
  return <aside
    aria-label="Medical disclaimer"
    className={`flex gap-3 rounded-2xl border border-border bg-muted/60 text-muted-foreground ${compact ? "p-3 text-xs" : "p-4 text-sm"}`}
  >
      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
      <p className="leading-relaxed">{DISCLAIMER_TEXT}</p>
    </aside>;
}
export {
  DISCLAIMER_TEXT,
  Disclaimer
};
