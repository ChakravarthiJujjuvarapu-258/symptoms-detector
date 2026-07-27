import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { AssessmentWizard } from "@/components/assessment/AssessmentWizard";
import type { AnalysisResult } from "@/lib/health/types";

const ResultsDashboard = lazy(() =>
  import("@/components/results/ResultsDashboard").then((m) => ({ default: m.ResultsDashboard })),
);

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Symptom Assessment — AI Symptoms Detector" },
      {
        name: "description",
        content:
          "Step-by-step symptom assessment: your profile, medical history, symptoms and severity, then AI-powered insights and risk level.",
      },
      { property: "og:title", content: "Symptom Assessment — AI Symptoms Detector" },
      {
        property: "og:description",
        content: "Answer four short steps and get educational health insights and a risk level.",
      },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {result ? (
        <Suspense
          fallback={<p className="py-20 text-center text-muted-foreground">Loading results…</p>}
        >
          <ResultsDashboard result={result} onRestart={() => setResult(null)} />
        </Suspense>
      ) : (
        <>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Symptom assessment</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Four short steps. Everything stays on this device.
          </p>
          <div className="mt-6">
            <AssessmentWizard onComplete={setResult} />
          </div>
        </>
      )}
    </div>
  );
}
