import { Link } from "@tanstack/react-router";
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Download,
  FlaskConical,
  HeartPulse,
  RotateCcw,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Disclaimer } from "@/components/Disclaimer";
import { EmergencyBanner } from "./EmergencyBanner";
import { HealthScoreRing } from "./HealthScoreRing";
import { RiskBadge } from "./RiskBadge";
import { RiskGauge } from "./RiskGauge";
import { SymptomCategoryChart } from "./SymptomCategoryChart";
import { RISK_META } from "@/lib/health/engine";
import { exportAssessmentPdf } from "@/lib/health/export";
function SectionCard({
  title,
  icon: Icon,
  children,
  className = "",
  delay = 0
}) {
  return <Card
    className="animate-fade-up rounded-3xl surface-panel"
    style={{ animationDelay: `${delay}ms` }}
  >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-teal" aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={className}>{children}</CardContent>
    </Card>;
}
function ResultsDashboard({
  result,
  onRestart
}) {
  const timeline = [
    {
      label: "Symptoms entered",
      detail: result.matchedSymptoms.slice(0, 4).join(", ") || "Free-text description recorded"
    },
    {
      label: "Analysis completed",
      detail: `${result.conditions.length} possible conditions reviewed`
    },
    {
      label: "Suggested next action",
      detail: result.risk === "emergency" ? "Seek emergency care immediately" : result.risk === "high" ? "Attend urgent care today" : result.risk === "moderate" ? "Book a doctor appointment within 24\u201348 hours" : "Self-care and monitoring, review if symptoms persist"
    }
  ];
  return <div className="space-y-5">
      {result.emergency && <EmergencyBanner />}

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">
            Your assessment results
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Possible directions only — never a confirmed diagnosis.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
    variant="outline"
    className="rounded-xl"
    onClick={() => exportAssessmentPdf(result)}
  >
            <Download className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
          <Button variant="secondary" className="rounded-xl" onClick={onRestart}>
            <RotateCcw className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">New check</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Risk level" icon={HeartPulse} delay={0}>
          <RiskBadge level={result.risk} />
          <div className="mt-3">
            <RiskGauge level={result.risk} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{RISK_META[result.risk].description}</p>
        </SectionCard>

        <SectionCard title="Health score" icon={Activity} delay={80}>
          <HealthScoreRing score={result.healthScore} />
          <p className="mt-2 text-center text-sm text-muted-foreground">
            A relative wellbeing indicator based on your reported symptoms, history and severity.
          </p>
        </SectionCard>

        <SectionCard title="Symptom categories" icon={ClipboardList} delay={160}>
          <SymptomCategoryChart data={result.categories} />
        </SectionCard>
      </div>

      <SectionCard title="Possible conditions" icon={Stethoscope} delay={200} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          These are possibilities that match the pattern you described, with inherent uncertainty. A
          clinician is needed to confirm or exclude any of them.
        </p>
        {result.conditions.map((c) => <div key={c.name} className="rounded-2xl border border-border bg-surface/60 p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <h3 className="min-w-0 font-semibold">{c.name}</h3>
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                {c.confidence}% match
              </span>
            </div>
            <Progress
    value={c.confidence}
    className="mt-2 h-1.5"
    aria-label={`${c.name} confidence`}
  />
            <p className="mt-3 text-sm text-muted-foreground">{c.explanation}</p>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Common symptoms
                </dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {c.commonSymptoms.map((s) => <span
    key={s}
    className="rounded-full bg-accent px-2.5 py-0.5 text-xs text-accent-foreground"
  >
                      {s}
                    </span>)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Typical treatment overview
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">{c.treatment}</dd>
              </div>
            </dl>
            {c.citations?.length ? <div className="mt-3 border-t border-border pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Verified against medical references
                </p>
                <ul className="mt-1.5 space-y-1">
                  {c.citations.map((ref) => <li key={ref.url} className="text-sm">
                      <a
    href={ref.url}
    target="_blank"
    rel="noopener noreferrer"
    className="font-medium text-primary underline underline-offset-4"
  >
                        {ref.title}
                      </a>
                      <span className="text-muted-foreground"> — {ref.source}</span>
                    </li>)}
                </ul>
              </div> : null}
          </div>)}
      </SectionCard>

      {result.sources?.length ? <SectionCard title="Sources & citations" icon={BookOpen} delay={210} className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Insights above were cross-checked against MedlinePlus, the consumer health library of the
            U.S. National Library of Medicine. Follow the links for the full, clinician-reviewed
            articles.
          </p>
          <ul className="space-y-3">
            {result.sources.map((ref) => <li key={ref.url} className="rounded-xl border border-border bg-surface/60 p-3">
                <a
    href={ref.url}
    target="_blank"
    rel="noopener noreferrer"
    className="font-semibold text-primary underline underline-offset-4"
  >
                  {ref.title}
                </a>
                <p className="mt-1 text-sm text-muted-foreground">{ref.snippet}</p>
                <p className="mt-1 text-xs text-muted-foreground">{ref.source}</p>
              </li>)}
          </ul>
        </SectionCard> : null}


      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Recommendations" icon={CheckCircle2} delay={240}>
          <ul className="space-y-2.5">
            {result.recommendations.map((r) => <li key={r} className="flex gap-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
                <span>{r}</span>
              </li>)}
          </ul>
        </SectionCard>

        <SectionCard title="Suggested tests to discuss" icon={FlaskConical} delay={280}>
          <ul className="flex flex-wrap gap-2">
            {result.tests.map((t) => <li
    key={t}
    className="rounded-xl border border-border bg-surface/60 px-3 py-1.5 text-sm font-medium"
  >
                {t}
              </li>)}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Only a clinician can decide which tests are appropriate for you.
          </p>
        </SectionCard>
      </div>

      <SectionCard title="Timeline" icon={CalendarClock} delay={320}>
        <ol className="relative space-y-5 border-l border-border pl-6">
          {timeline.map((t) => <li key={t.label}>
              <span
    className="absolute -left-[7px] mt-1.5 size-3.5 rounded-full border-2 border-background bg-teal"
    aria-hidden="true"
  />
              <p className="font-semibold">{t.label}</p>
              <p className="text-sm text-muted-foreground">{t.detail}</p>
            </li>)}
        </ol>
      </SectionCard>

      <Disclaimer />

      <p className="text-center text-sm text-muted-foreground">
        Saved to your{" "}
        <Link
    to="/history"
    className="font-semibold text-primary underline-offset-4 hover:underline"
  >
          assessment history
        </Link>
        .
      </p>
    </div>;
}
export {
  ResultsDashboard
};
