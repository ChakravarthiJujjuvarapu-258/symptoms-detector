import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, Brain, Camera, ClipboardList, HeartPulse, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/Disclaimer";
const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Symptoms Detector \u2014 AI-Powered Symptom Checker" },
      {
        name: "description",
        content: "Describe your symptoms in plain language and receive AI-powered health insights, risk levels and educational recommendations. Not a medical diagnosis."
      },
      { property: "og:title", content: "AI Symptoms Detector \u2014 AI-Powered Symptom Checker" },
      {
        property: "og:description",
        content: "Describe your symptoms and receive AI-powered health insights, risk levels and recommendations."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ]
  }),
  component: Landing
});
const FEATURES = [
  {
    icon: Brain,
    title: "Natural language input",
    text: "Describe how you feel in your own words \u2014 duration, severity and all."
  },
  {
    icon: HeartPulse,
    title: "Risk triage",
    text: "Low, moderate, high or emergency, with instant escalation for red-flag symptoms."
  },
  {
    icon: ClipboardList,
    title: "Actionable summary",
    text: "Possible conditions, recommendations and tests to discuss with a clinician."
  },
  {
    icon: Lock,
    title: "Private by design",
    text: "Assessments are stored locally in your browser, never uploaded."
  }
];
function Landing() {
  return <div className="kinetic-page mx-auto max-w-6xl px-4 py-8 sm:px-7 sm:py-12">
      <section className="relative overflow-hidden border-b border-border pb-10 pt-5 sm:pb-14 sm:pt-10">
        <div className="relative max-w-3xl">
          <span className="animate-fade-in inline-flex items-center gap-2 border-l-2 border-gold pl-3 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="size-3.5 text-teal" aria-hidden="true" />
            Private, educational health guidance
          </span>
          <h1 className="display-title animate-fade-up mt-7 max-w-2xl">
            Clarity for the moments when your health feels uncertain.
          </h1>
          <p
    className="animate-fade-up mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg"
    style={{ animationDelay: "80ms" }}
  >
            Describe what feels different and receive a structured, safety-aware overview to help you decide what to do next.
          </p>
          <div
    className="animate-fade-up mt-8 flex flex-wrap gap-3"
    style={{ animationDelay: "160ms" }}
  >
            <Button
    asChild
    size="lg"
    className="kinetic-button kinetic-button--gold min-h-12 px-7 text-base"
  >
              <Link to="/assessment">
                <Activity className="size-5" aria-hidden="true" />
                Start Assessment
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="kinetic-button min-h-12 px-7 text-base">
              <Link to="/image-analysis"><Camera className="size-5" aria-hidden="true" />Analyze an image</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          What the assessment gives you
        </h2>
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => <article
    key={f.title}
    className="animate-fade-up bg-card p-5 transition-colors duration-300 hover:bg-accent/40"
    style={{ animationDelay: `${i * 70}ms` }}
  >
              <span className="kinetic-icon">
                <f.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="section-title mt-4 text-lg">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
            </article>)}
        </div>

        <div className="mt-10">
          <Disclaimer />
        </div>
      </section>
    </div>;
}
export {
  Route
};
