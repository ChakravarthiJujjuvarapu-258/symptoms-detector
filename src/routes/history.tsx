import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Disclaimer } from "@/components/Disclaimer";
import { RiskBadge } from "@/components/results/RiskBadge";
import { deleteAssessment, loadHistory } from "@/lib/health/storage";
import { exportAssessmentPdf } from "@/lib/health/export";
import type { AnalysisResult } from "@/lib/health/types";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Assessment History — AI Symptoms Detector" },
      {
        name: "description",
        content:
          "Review, search, export or delete your previous symptom assessments. All records are stored locally in your browser.",
      },
      { property: "og:title", content: "Assessment History — AI Symptoms Detector" },
      {
        property: "og:description",
        content: "Your past symptom checks with dates, risk levels and possible conditions.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [records, setRecords] = useState<AnalysisResult[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setRecords(loadHistory());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.input.symptoms.toLowerCase().includes(q) ||
        r.risk.includes(q) ||
        r.conditions.some((c) => c.name.toLowerCase().includes(q)),
    );
  }, [records, query]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Assessment history</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Stored locally on this device only. {records.length} saved{" "}
        {records.length === 1 ? "record" : "records"}.
      </p>

      <div className="relative mt-6">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <label htmlFor="history-search" className="sr-only">
          Search assessments
        </label>
        <Input
          id="history-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search symptoms, conditions or risk level"
          className="rounded-2xl pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-6 rounded-3xl surface-panel">
          <CardContent className="py-16 text-center">
            <p className="font-semibold">No assessments found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {records.length === 0
                ? "Run your first symptom check to build your history."
                : "Try a different search term."}
            </p>
            <Button asChild className="mt-5 rounded-xl">
              <Link to="/assessment">Start assessment</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="mt-6 space-y-4">
          {filtered.map((r, i) => (
            <li key={r.id}>
              <Card className="animate-fade-up rounded-3xl surface-panel" style={{ animationDelay: `${i * 50}ms` }}>
                <CardContent className="space-y-3 py-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm">{r.input.symptoms}</p>
                    </div>
                    <RiskBadge level={r.risk} size="sm" />
                  </div>

                  <ul className="flex flex-wrap gap-1.5">
                    {r.conditions.slice(0, 3).map((c) => (
                      <li
                        key={c.name}
                        className="rounded-full bg-accent px-2.5 py-0.5 text-xs text-accent-foreground"
                      >
                        {c.name} · {c.confidence}%
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => exportAssessmentPdf(r)}
                    >
                      <Download className="size-4" aria-hidden="true" />
                      Export PDF
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-destructive hover:text-destructive"
                      onClick={() => setRecords(deleteAssessment(r.id))}
                      aria-label={`Delete assessment from ${new Date(r.createdAt).toLocaleString()}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
