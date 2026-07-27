import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Brain, ClipboardList, HeartPulse, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/Disclaimer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Symptoms Detector — AI-Powered Symptom Checker" },
      {
        name: "description",
        content:
          "Describe your symptoms in plain language and receive AI-powered health insights, risk levels and educational recommendations. Not a medical diagnosis.",
      },
      { property: "og:title", content: "AI Symptoms Detector — AI-Powered Symptom Checker" },
      {
        property: "og:description",
        content:
          "Describe your symptoms and receive AI-powered health insights, risk levels and recommendations.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Brain,
    title: "Natural language input",
    text: "Describe how you feel in your own words — duration, severity and all.",
  },
  {
    icon: HeartPulse,
    title: "Risk triage",
    text: "Low, moderate, high or emergency, with instant escalation for red-flag symptoms.",
  },
  {
    icon: ClipboardList,
    title: "Actionable summary",
    text: "Possible conditions, recommendations and tests to discuss with a clinician.",
  },
  {
    icon: Lock,
    title: "Private by design",
    text: "Assessments are stored locally in your browser, never uploaded.",
  },
];

function Landing() {
  return (
    <div>
      <section className="grid-backdrop">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="size-3.5 text-teal" aria-hidden="true" />
            Educational health insights, never a diagnosis
          </span>
          <h1 className="animate-fade-up mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
            AI Symptoms Detector
          </h1>
          <p
            className="animate-fade-up mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg"
            style={{ animationDelay: "80ms" }}
          >
            Describe your symptoms and receive AI-powered health insights.
          </p>
          <div
            className="animate-fade-up mt-8 flex flex-wrap justify-center gap-3"
            style={{ animationDelay: "160ms" }}
          >
            <Button
              asChild
              size="lg"
              className="min-h-12 rounded-2xl clinical-gradient px-8 text-base text-primary-foreground hover:opacity-95"
            >
              <Link to="/assessment">
                <Activity className="size-5" aria-hidden="true" />
                Start Assessment
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          What the assessment gives you
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              className="animate-fade-up rounded-3xl surface-panel p-5 transition-transform duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className="grid size-10 place-items-center rounded-2xl bg-accent text-accent-foreground">
                <f.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <Disclaimer />
        </div>
      </section>
    </div>
  );
}
