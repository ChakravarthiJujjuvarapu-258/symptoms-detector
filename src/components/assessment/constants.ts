export const MEDICAL_HISTORY_OPTIONS = [
  "Diabetes",
  "Hypertension",
  "Heart Disease",
  "Asthma",
  "Cancer",
  "Kidney Disease",
  "Liver Disease",
  "Pregnancy",
  "Allergies",
  "None",
];

export const DURATION_OPTIONS = [
  { value: "<24h", label: "Less than 24 hours" },
  { value: "1-3d", label: "1–3 days" },
  { value: "4-7d", label: "4–7 days" },
  { value: ">1w", label: "More than a week" },
] as const;

export const STEPS = ["About you", "Medical history", "Symptoms", "More detail"];
