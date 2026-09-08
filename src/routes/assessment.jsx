import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { AssessmentWizard } from "@/components/assessment/AssessmentWizard";
const ResultsDashboard = lazy(
  () => import("@/components/results/ResultsDashboard").then((m) => ({ default: m.ResultsDashboard }))
);
const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Symptom Assessment \u2014 AI Symptoms Detector" },
      {
        name: "description",
        content: "Step-by-step symptom assessment: your profile, medical history, symptoms and severity, then AI-powered insights and risk level."
      },
      { property: "og:title", content: "Symptom Assessment \u2014 AI Symptoms Detector" },
      {
        property: "og:description",
        content: "Answer four short steps and get educational health insights and a risk level."
      }
    ]
  }),
  component: AssessmentPage
});
function AssessmentPage() {
  const [result, setResult] = useState(null);
  return <div className="kinetic-page mx-auto max-w-5xl px-4 py-7 sm:px-7 sm:py-10">
      {result ? <Suspense
    fallback={<p className="py-20 text-center text-muted-foreground">Loading results…</p>}
  >
          <ResultsDashboard result={result} onRestart={() => setResult(null)} />
        </Suspense> : <>
          <p className="eyebrow animate-fade-in">Guided health assessment</p>
          <h1 className="display-title animate-fade-up mt-2">Tell us what feels different.</h1>
          <p className="animate-fade-up mt-2 max-w-xl text-sm text-muted-foreground" style={{ animationDelay: "70ms" }}>
            Four short steps. Everything stays on this device.
          </p>
          <div className="mt-6">
            <AssessmentWizard onComplete={setResult} />
          </div>
        </>}
    </div>;
}
export {
  Route
};
