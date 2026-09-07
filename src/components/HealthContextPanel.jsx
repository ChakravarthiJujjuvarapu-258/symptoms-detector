import { Activity, Clock3, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const HEALTH_SIGNALS = [
  { icon: ShieldCheck, label: "Privacy", value: "On-device history" },
  { icon: Clock3, label: "Assessment", value: "About 4 minutes" },
  { icon: HeartPulse, label: "Safety", value: "Red-flag screening" }
];

function HealthContextPanel() {
  return (
    <aside className="context-rail hidden xl:flex" aria-label="Health information">
      <div className="context-rail__status">
        <span className="status-pulse" aria-hidden="true" />
        <span>Clinical guidance online</span>
      </div>

      <section className="glass-panel context-rail__focus">
        <div className="context-rail__icon">
          <Sparkles className="size-4" aria-hidden="true" />
        </div>
        <p className="eyebrow">AI health workspace</p>
        <h2>Clarity before conclusions.</h2>
        <p>
          Describe every symptom, its duration, and what makes it better or worse. Small details can
          improve the educational guidance.
        </p>
      </section>

      <div className="context-rail__signals">
        {HEALTH_SIGNALS.map((signal) => (
          <div className="context-signal" key={signal.label}>
            <signal.icon className="size-4" aria-hidden="true" />
            <div>
              <span>{signal.label}</span>
              <strong>{signal.value}</strong>
            </div>
          </div>
        ))}
      </div>

      <section className="context-rail__urgent">
        <Activity className="size-4" aria-hidden="true" />
        <div>
          <strong>Symptoms feel urgent?</strong>
          <p>Do not wait for an AI result. Contact local emergency services.</p>
        </div>
      </section>

      <Button asChild variant="outline" className="w-full">
        <Link to="/nearby">Find nearby care</Link>
      </Button>
    </aside>
  );
}

export { HealthContextPanel };