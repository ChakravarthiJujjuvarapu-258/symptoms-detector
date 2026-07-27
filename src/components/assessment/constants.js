const MEDICAL_HISTORY_OPTIONS = [
  "Diabetes",
  "Hypertension",
  "Heart Disease",
  "Asthma",
  "Cancer",
  "Kidney Disease",
  "Liver Disease",
  "Pregnancy",
  "Allergies",
  "None"
];
const DURATION_OPTIONS = [
  { value: "<24h", label: "Less than 24 hours" },
  { value: "1-3d", label: "1\u20133 days" },
  { value: "4-7d", label: "4\u20137 days" },
  { value: ">1w", label: "More than a week" }
];
const STEPS = ["About you", "Medical history", "Symptoms", "More detail"];
export {
  DURATION_OPTIONS,
  MEDICAL_HISTORY_OPTIONS,
  STEPS
};
