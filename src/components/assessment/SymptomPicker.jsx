import { useMemo, useState } from "react";
import { Plus, Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SYMPTOM_GROUPS, searchSymptoms } from "@/lib/health/symptomList";
import respiratory from "@/assets/conditions/respiratory.jpg";
import digestive from "@/assets/conditions/digestive.jpg";
import cardiac from "@/assets/conditions/cardiac.jpg";
import neuro from "@/assets/conditions/neuro.jpg";
import musculoskeletal from "@/assets/conditions/musculoskeletal.jpg";
import skin from "@/assets/conditions/skin.jpg";
import infection from "@/assets/conditions/infection.jpg";
import general from "@/assets/conditions/general.jpg";

const GROUP_IMAGES = {
  "General & whole body": infection,
  "Head, eyes, ears, nose & throat": respiratory,
  "Chest, heart & breathing": cardiac,
  "Stomach & digestion": digestive,
  "Urinary & reproductive": general,
  "Skin, hair & nails": skin,
  "Muscles, joints & bones": musculoskeletal,
  "Brain, nerves & mental health": neuro,
  "Allergy & immune": skin,
  "Hormones & metabolism": general,
  "Children & infants": infection
};

function SymptomPicker({ value, onAdd }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(SYMPTOM_GROUPS[0].group);
  const lower = value.toLowerCase();
  const has = (s) => lower.includes(s.toLowerCase());
  const results = useMemo(() => searchSymptoms(query, 15), [query]);
  const group = SYMPTOM_GROUPS.find((g) => g.group === active);

  const Chip = ({ label }) => {
    const added = has(label);
    return (
      <button
        type="button"
        onClick={() => !added && onAdd(label)}
        aria-pressed={added}
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors ${
          added
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-card hover:border-primary hover:text-primary"
        }`}
      >
        {added ? <Check className="size-3" aria-hidden="true" /> : <Plus className="size-3" aria-hidden="true" />}
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface/50 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search symptoms, e.g. cough, rash, dizziness"
          aria-label="Search symptoms"
          className="kinetic-input pl-9"
        />
      </div>

      {query.trim().length >= 2 ? (
        <div className="flex flex-wrap gap-2" aria-live="polite">
          {results.length ? results.map((s) => <Chip key={s.label} label={s.label} />) : (
            <p className="text-xs text-muted-foreground">
              No match in the list — just type it in the box above, the AI understands any symptom.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SYMPTOM_GROUPS.map((g) => (
              <button
                key={g.group}
                type="button"
                onClick={() => setActive(g.group)}
                aria-pressed={active === g.group}
                className={`flex shrink-0 items-center gap-2 rounded-lg border p-1.5 pr-3 text-xs transition-colors ${
                  active === g.group ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
                }`}
              >
                <img src={GROUP_IMAGES[g.group]} alt="" className="size-8 rounded-md object-cover" loading="lazy" />
                {g.group}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {group.symptoms.map((s) => <Chip key={s} label={s} />)}
          </div>
        </>
      )}
    </div>
  );
}

export { SymptomPicker };
