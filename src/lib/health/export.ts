import { RISK_META } from "./engine";
import type { AnalysisResult } from "./types";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Opens a print-ready document; the browser print dialog can save it as PDF. */
export function exportAssessmentPdf(result: AnalysisResult): boolean {
  const win = window.open("", "_blank", "width=880,height=1000");
  if (!win) return false;

  const date = new Date(result.createdAt).toLocaleString();
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Assessment ${escapeHtml(date)}</title>
<style>
  body{font-family:system-ui,-apple-system,sans-serif;color:#12213a;margin:40px;line-height:1.55}
  h1{font-size:22px;margin:0 0 4px} h2{font-size:14px;margin:24px 0 8px;text-transform:uppercase;letter-spacing:.06em;color:#3f5a86}
  .meta{color:#5b6b85;font-size:12px} .badge{display:inline-block;padding:4px 10px;border-radius:999px;background:#eef4ff;font-size:12px;font-weight:700}
  ul{padding-left:18px;margin:6px 0} li{margin:3px 0;font-size:13px}
  .card{border:1px solid #dce4f2;border-radius:12px;padding:12px;margin:8px 0}
  .disclaimer{margin-top:28px;border-top:1px solid #dce4f2;padding-top:12px;font-size:11px;color:#5b6b85}
</style></head><body>
<h1>AI Symptoms Detector — Assessment Report</h1>
<p class="meta">${escapeHtml(date)}</p>
<p><span class="badge">Risk: ${RISK_META[result.risk].label}</span> <span class="badge">Health score: ${result.healthScore}/100</span></p>
<h2>Reported symptoms</h2><p>${escapeHtml(result.input.symptoms)}</p>
<h2>Possible conditions (not a diagnosis)</h2>
${result.conditions
  .map(
    (c) =>
      `<div class="card"><strong>${escapeHtml(c.name)}</strong> — ${c.confidence}% match<br><span style="font-size:13px">${escapeHtml(c.explanation)}</span><br><em style="font-size:12px">Typical care: ${escapeHtml(c.treatment)}</em></div>`,
  )
  .join("")}
<h2>Recommendations</h2><ul>${result.recommendations.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
<h2>Suggested tests to discuss with a clinician</h2><ul>${result.tests.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
<p class="disclaimer">This application provides informational and educational guidance only. It is not a medical diagnosis and should not replace consultation with a qualified healthcare professional. If you have severe or worsening symptoms, seek medical care immediately.</p>
<script>window.onload=()=>window.print()<\/script>
</body></html>`;

  win.document.write(html);
  win.document.close();
  return true;
}
