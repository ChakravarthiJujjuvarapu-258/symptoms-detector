import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Sparkle, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Disclaimer } from "@/components/Disclaimer";
import { EmergencyBanner } from "@/components/results/EmergencyBanner";
import { DURATION_OPTIONS, MEDICAL_HISTORY_OPTIONS, STEPS } from "./constants";
import { analyzeSymptoms, detectEmergency } from "@/lib/health/engine";
import { saveAssessment, setLastResult } from "@/lib/health/storage";
import type { AnalysisResult, AssessmentInput, Extras, Gender, Profile } from "@/lib/health/types";

const YES_NO: { key: keyof Extras; label: string }[] = [
  { key: "recentTravel", label: "Recent travel?" },
  { key: "sickContact", label: "Recent contact with a sick person?" },
  { key: "smoker", label: "Smoker?" },
  { key: "alcohol", label: "Alcohol use?" },
];

export function AssessmentWizard({ onComplete }: { onComplete: (r: AnalysisResult) => void }) {
  const [step, setStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    age: "",
    gender: "",
    heightCm: "",
    weightKg: "",
  });
  const [history, setHistory] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState("");
  const [extras, setExtras] = useState<Extras>({
    duration: "",
    pain: 3,
    temperature: "",
    recentTravel: false,
    sickContact: false,
    smoker: false,
    alcohol: false,
  });

  const emergencyHit = detectEmergency(symptoms).length > 0;
  const canContinue =
    step === 0
      ? profile.age.trim() !== "" && profile.gender !== ""
      : step === 2
        ? symptoms.trim().length >= 8
        : true;

  const toggleHistory = (option: string) => {
    setHistory((prev) => {
      if (option === "None") return prev.includes("None") ? [] : ["None"];
      const without = prev.filter((p) => p !== "None");
      return without.includes(option) ? without.filter((p) => p !== option) : [...without, option];
    });
  };

  const runAnalysis = () => {
    setAnalyzing(true);
    const input: AssessmentInput = { profile, history, symptoms, extras };
    window.setTimeout(() => {
      const result = analyzeSymptoms(input);
      saveAssessment(result);
      setLastResult(result);
      setAnalyzing(false);
      onComplete(result);
    }, 2200);
  };

  if (analyzing) {
    return (
      <Card className="rounded-3xl surface-panel">
        <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
          <span className="grid size-16 place-items-center rounded-full clinical-gradient text-primary-foreground animate-pulse-ring">
            <Loader2 className="size-7 animate-spin" aria-hidden="true" />
          </span>
          <p className="text-lg font-semibold" role="status" aria-live="polite">
            AI is analyzing your symptoms...
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Matching your description against symptom patterns, your medical history and severity
            signals.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <ol className="grid grid-cols-4 gap-2" aria-label="Assessment progress">
        {STEPS.map((label, i) => (
          <li key={label} className="min-w-0">
            <div
              className={`h-1.5 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`}
              aria-hidden="true"
            />
            <p
              className={`mt-2 truncate text-xs font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}
              aria-current={i === step ? "step" : undefined}
            >
              {i + 1}. {label}
            </p>
          </li>
        ))}
      </ol>

      <Card className="animate-fade-up rounded-3xl surface-panel" key={step}>
        <CardContent className="space-y-5 py-6">
          {step === 0 && (
            <fieldset className="space-y-5">
              <legend className="text-lg font-bold">Tell us about you</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min={0}
                    max={120}
                    inputMode="numeric"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    placeholder="e.g. 34"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profile.gender}
                    onValueChange={(v) => setProfile({ ...profile, gender: v as Gender })}
                  >
                    <SelectTrigger id="gender" className="w-full rounded-xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other / prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    inputMode="numeric"
                    value={profile.heightCm}
                    onChange={(e) => setProfile({ ...profile, heightCm: e.target.value })}
                    placeholder="e.g. 172"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    inputMode="numeric"
                    value={profile.weightKg}
                    onChange={(e) => setProfile({ ...profile, weightKg: e.target.value })}
                    placeholder="e.g. 68"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <fieldset className="space-y-4">
              <legend className="text-lg font-bold">Medical history</legend>
              <p className="text-sm text-muted-foreground">
                Select any conditions that apply to you.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {MEDICAL_HISTORY_OPTIONS.map((option) => (
                  <label
                    key={option}
                    htmlFor={`hist-${option}`}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface/50 px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Checkbox
                      id={`hist-${option}`}
                      checked={history.includes(option)}
                      onCheckedChange={() => toggleHistory(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="symptoms" className="text-lg font-bold">
                  Describe your symptoms
                </Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Write naturally — include how long you've had them and how severe they feel.
                </p>
              </div>
              <Textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={8}
                className="rounded-2xl text-base"
                placeholder="Example: I have had a fever for 3 days with sore throat, headache, cough, and fatigue."
              />
              {emergencyHit && <EmergencyBanner />}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">A few more details</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="duration">How long have you had these symptoms?</Label>
                  <Select
                    value={extras.duration}
                    onValueChange={(v) =>
                      setExtras({ ...extras, duration: v as Extras["duration"] })
                    }
                  >
                    <SelectTrigger id="duration" className="w-full rounded-xl">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="temperature">Temperature (optional)</Label>
                  <Input
                    id="temperature"
                    value={extras.temperature}
                    onChange={(e) => setExtras({ ...extras, temperature: e.target.value })}
                    placeholder="e.g. 38.5"
                    inputMode="decimal"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pain">Pain scale: {extras.pain} / 10</Label>
                <Slider
                  id="pain"
                  min={1}
                  max={10}
                  step={1}
                  value={[extras.pain]}
                  onValueChange={([v]) => setExtras({ ...extras, pain: v })}
                  aria-label="Pain level from 1 to 10"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {YES_NO.map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-border bg-surface/50 px-3 py-2.5"
                  >
                    <Label htmlFor={`sw-${key}`} className="text-sm font-normal">
                      {label}
                    </Label>
                    <Switch
                      id={`sw-${key}`}
                      checked={Boolean(extras[key])}
                      onCheckedChange={(v) => setExtras({ ...extras, [key]: v })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Button>

            {step < 3 ? (
              <Button
                className="rounded-xl"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canContinue}
              >
                Continue
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                className="rounded-xl clinical-gradient text-primary-foreground"
                onClick={runAnalysis}
              >
                <Sparkle className="size-4" aria-hidden="true" />
                Analyze symptoms
              </Button>
            )}
          </div>

          {step === 0 && !canContinue && (
            <p className="text-xs text-muted-foreground">Age and gender are needed to continue.</p>
          )}
          {step === 2 && !canContinue && (
            <p className="text-xs text-muted-foreground">
              Add a little more detail about your symptoms to continue.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Stethoscope className="size-3.5 text-teal" aria-hidden="true" />
        Nothing you enter leaves your device — assessments are stored locally.
      </div>

      <Disclaimer compact />
    </div>
  );
}
