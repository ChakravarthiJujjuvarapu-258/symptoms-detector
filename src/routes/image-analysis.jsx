import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  Eye,
  ImageUp,
  Loader2,
  Lock,
  RefreshCw,
  Sparkles,
  Stethoscope,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Disclaimer } from "@/components/Disclaimer";
import { conditionVisual } from "@/lib/health/imagery";

const TITLE = "AI Symptom Image Analysis \u2014 AI Symptoms Detector";
const DESCRIPTION =
  "Upload a photo of a visible symptom and get an educational description of visible features and possible look-alike conditions. Not a diagnosis.";

const Route = createFileRoute("/image-analysis")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ImageAnalysisPage,
});

const ACCEPT = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;

const STAGES = [
  "Analyzing image\u2026",
  "Identifying visible features\u2026",
  "Comparing with medical reference information\u2026",
];

const MATCH_STYLES = {
  High: "bg-destructive/10 text-destructive border-destructive/30",
  Moderate: "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
  Low: "bg-teal/10 text-teal border-teal/30",
};

function ImageAnalysisPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!loading) return undefined;
    setStage(0);
    const id = setInterval(() => setStage((s) => (s < STAGES.length - 1 ? s + 1 : s)), 2200);
    return () => clearInterval(id);
  }, [loading]);

  const accept = useCallback((next) => {
    setError("");
    setResult(null);
    if (!next) return;
    if (!ACCEPT.includes((next.type || "").toLowerCase())) {
      setError("Unsupported format. Please upload a JPG, JPEG, PNG or WEBP image.");
      return;
    }
    if (next.size > MAX_BYTES) {
      setError("Image is larger than 8 MB. Please upload a smaller photo.");
      return;
    }
    setFile(next);
  }, []);

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    accept(event.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await fetch("/api/analyze-symptom-image", { method: "POST", body });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Image analysis failed. Please try again.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network problem while analysing the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const insufficient =
    result && !result.visible_features?.length && !result.possible_conditions?.length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="animate-fade-up space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-teal" aria-hidden="true" />
          Educational visual analysis
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Symptom image analysis</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Upload a clear, well-lit photo of a visible symptom. The assistant describes what can be
          seen and lists conditions that can look similar. It cannot diagnose.
        </p>
      </header>

      <Card className="mt-6 overflow-hidden rounded-2xl">
        <CardContent className="p-4 sm:p-6">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT.join(",")}
            className="sr-only"
            onChange={(e) => accept(e.target.files?.[0])}
            aria-label="Upload symptom image"
          />

          {!preview ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                dragging ? "border-teal bg-teal/5" : "border-border bg-muted/30"
              }`}
            >
              <span className="grid size-14 place-items-center rounded-2xl clinical-gradient text-primary-foreground">
                <ImageUp className="size-7" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <p className="text-base font-semibold">Drag and drop your photo here</p>
                <p className="text-xs text-muted-foreground">JPG, JPEG, PNG or WEBP &middot; up to 8 MB</p>
              </div>
              <Button size="lg" className="min-h-11 rounded-xl" onClick={() => inputRef.current?.click()}>
                <Upload className="size-4" aria-hidden="true" />
                Upload Symptom Image
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)] sm:items-start">
              <figure className="relative overflow-hidden rounded-2xl border border-border bg-muted">
                <img src={preview} alt="Your uploaded symptom photo" className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="Remove uploaded image"
                  className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-background/90 text-foreground shadow"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </figure>
              <div className="space-y-3">
                <p className="text-sm font-medium">{file?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={analyze} disabled={loading} className="min-h-11 rounded-xl">
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                    Analyze Image
                  </Button>
                  <Button
                    variant="outline"
                    className="min-h-11 rounded-xl"
                    onClick={() => inputRef.current?.click()}
                    disabled={loading}
                  >
                    <RefreshCw className="size-4" aria-hidden="true" />
                    Replace
                  </Button>
                  <Button
                    variant="ghost"
                    className="min-h-11 rounded-xl"
                    onClick={removeImage}
                    disabled={loading}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete image
                  </Button>
                  {result ? (
                    <Button
                      variant="ghost"
                      className="min-h-11 rounded-xl"
                      onClick={() => setResult(null)}
                      disabled={loading}
                    >
                      Clear analysis
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {error ? (
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          ) : null}

          {loading ? (
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-muted/40 p-4" aria-live="polite">
              <span className="relative grid size-11 shrink-0 place-items-center rounded-full clinical-gradient text-primary-foreground">
                <span className="absolute inset-0 animate-pulse-ring rounded-full bg-teal/40" aria-hidden="true" />
                <Camera className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{STAGES[stage]}</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full clinical-gradient transition-all duration-700"
                    style={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {result ? (
        <section className="mt-8 animate-fade-up space-y-6" aria-label="Image analysis results">
          {insufficient ? (
            <Card className="rounded-2xl border-amber-500/40">
              <CardContent className="space-y-2 p-5">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <AlertTriangle className="size-5 text-amber-500" aria-hidden="true" />
                  Image quality is insufficient
                </h2>
                <p className="text-sm text-muted-foreground">{result.explanation}</p>
                <p className="text-sm text-muted-foreground">{result.recommendation}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="rounded-2xl">
                <CardContent className="p-5">
                  <h2 className="text-lg font-semibold">Visible features</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    What can be seen in the photo &mdash; visual description only.
                  </p>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {result.visible_features.map((f) => (
                      <li key={f.label} className="rounded-xl border border-border bg-muted/40 p-3">
                        <p className="text-sm font-medium">{f.label}</p>
                        {f.detail ? (
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.detail}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Possible look-alike conditions</h2>
                {result.possible_conditions.map((c) => {
                  const visual = conditionVisual({
                    name: c.name,
                    commonSymptoms: c.common_symptoms,
                    explanation: c.why,
                  });
                  return (
                    <Card key={c.name} className="overflow-hidden rounded-2xl">
                      <CardContent className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,200px)]">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold">{c.name}</h3>
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${MATCH_STYLES[c.match]}`}
                            >
                              Match: {c.match}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            The image shows features that can sometimes be seen with {c.name.toLowerCase()},
                            but this image alone cannot determine the cause.
                          </p>
                          {c.why ? (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Why it may match
                              </p>
                              <p className="mt-1 text-sm leading-relaxed">{c.why}</p>
                            </div>
                          ) : null}
                          {c.common_symptoms?.length ? (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Common symptoms
                              </p>
                              <ul className="mt-1 flex flex-wrap gap-1.5">
                                {c.common_symptoms.map((s) => (
                                  <li key={s} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                          <p className="text-xs text-muted-foreground">
                            Learn more:{" "}
                            <a
                              className="underline underline-offset-2"
                              href={`https://medlineplus.gov/search/?query=${encodeURIComponent(c.name)}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              MedlinePlus &mdash; {c.name}
                            </a>
                            {c.learn_more ? ` \u00b7 ${c.learn_more}` : ""}
                          </p>
                        </div>
                        <figure className="space-y-2">
                          <img
                            src={visual.image}
                            alt={visual.alt}
                            loading="lazy"
                            className="w-full rounded-xl border border-border object-cover"
                          />
                          <figcaption className="text-[11px] leading-snug text-muted-foreground">
                            Educational reference image &mdash; not a diagnosis.
                          </figcaption>
                          <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                            <Stethoscope className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden="true" />
                            Usually seen by: {visual.specialist}
                          </p>
                        </figure>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="rounded-2xl">
                <CardContent className="space-y-3 p-5">
                  <h2 className="text-lg font-semibold">Explanation</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{result.explanation}</p>
                  <h3 className="text-sm font-semibold">Recommendation</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{result.recommendation}</p>
                  <p className="text-xs text-muted-foreground">
                    Overall visual confidence: {result.confidence} &middot; Professional evaluation
                    recommended.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </section>
      ) : null}

      <div className="mt-8 space-y-4">
        <aside
          aria-label="Image analysis disclaimer"
          className="flex gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-foreground"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
          <p className="leading-relaxed">
            AI image analysis is for educational purposes only. It cannot diagnose medical
            conditions. Images of similar symptoms can have different causes. Consult a qualified
            healthcare professional for an accurate diagnosis.
          </p>
        </aside>
        <aside
          aria-label="Privacy notice"
          className="flex gap-3 rounded-2xl border border-border bg-muted/60 p-4 text-sm text-muted-foreground"
        >
          <Lock className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
          <p className="leading-relaxed">
            Your photo stays in your browser and is sent once to the analysis service for this
            request only. It is never stored on our servers or shown publicly. Use &ldquo;Delete
            image&rdquo; at any time to remove it.
          </p>
        </aside>
        <Disclaimer compact />
      </div>
    </div>
  );
}

export { Route };
