import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, Download, Mail, MapPin, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { RISK_META } from "@/lib/health/engine";
import { exportAssessmentPdf } from "@/lib/health/export";

const DEFAULT_QUESTIONS = [
  "Based on my symptoms, what are the most likely explanations?",
  "Are there any warning signs I should watch for at home?",
  "Which tests, if any, would you recommend and why?",
  "What can I safely do to relieve my symptoms in the meantime?",
  "When should I come back if things do not improve?"
];

function buildReport(result) {
  const date = new Date(result.createdAt).toLocaleString();
  const lines = [
    "AI Symptoms Detector — summary for my doctor",
    `Generated: ${date}`,
    "",
    `Risk level (educational estimate): ${RISK_META[result.risk].label}`,
    `Health score: ${result.healthScore}/100`,
    "",
    "Reported symptoms:",
    result.input?.symptoms || "—",
    "",
    "Possible conditions suggested by the tool (not a diagnosis):",
    ...result.conditions.map((c) => `• ${c.name} — ${c.confidence}% match. ${c.explanation}`),
    "",
    "Recommendations shown to me:",
    ...(result.recommendations ?? []).map((r) => `• ${r}`),
    "",
    "Tests suggested for discussion:",
    ...(result.tests ?? []).map((t) => `• ${t}`),
    "",
    "Questions I would like to ask:",
    ...(result.followUpQuestions?.length ? result.followUpQuestions : DEFAULT_QUESTIONS).map(
      (q) => `• ${q}`
    ),
    "",
    "Note: this summary was produced by an educational AI tool and is not a medical diagnosis."
  ];
  return lines.join("\n");
}

function DiscussWithDoctor({ result }) {
  const [open, setOpen] = useState(false);
  const report = useMemo(() => buildReport(result), [result]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      toast.success("Summary copied — paste it into a message to your doctor.");
    } catch {
      toast.error("Could not copy. Select the text and copy it manually.");
    }
  };

  const mailto = `mailto:?subject=${encodeURIComponent(
    "Symptom summary for my appointment"
  )}&body=${encodeURIComponent(report)}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl clinical-gradient text-primary-foreground hover:opacity-95">
          <Stethoscope className="size-4" aria-hidden="true" />
          Discuss With a Doctor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Discuss with a doctor</DialogTitle>
          <DialogDescription>
            Share this summary and question list with a qualified healthcare professional. It is
            educational information, not a diagnosis.
          </DialogDescription>
        </DialogHeader>

        <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl border border-border bg-surface/60 p-4 text-sm leading-relaxed">
          {report}
        </pre>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl" onClick={copy}>
            <Copy className="size-4" aria-hidden="true" />
            Copy summary
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => exportAssessmentPdf(result)}>
            <Download className="size-4" aria-hidden="true" />
            Download PDF
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <a href={mailto}>
              <Mail className="size-4" aria-hidden="true" />
              Email it
            </a>
          </Button>
          <Button asChild className="rounded-xl">
            <Link to="/nearby" onClick={() => setOpen(false)}>
              <MapPin className="size-4" aria-hidden="true" />
              Find care near me
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { DiscussWithDoctor };
