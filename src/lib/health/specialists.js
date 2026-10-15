/** Map assessment symptom categories to the kind of doctor to look for nearby. */
export const CATEGORY_SPECIALIST = {
  Cardiac: { label: "Cardiologist", query: "cardiologist" },
  Respiratory: { label: "Pulmonologist / chest specialist", query: "pulmonologist chest clinic" },
  Digestive: { label: "Gastroenterologist", query: "gastroenterologist" },
  Neurological: { label: "Neurologist", query: "neurologist" },
  Musculoskeletal: { label: "Orthopedic doctor", query: "orthopedic doctor" },
  Skin: { label: "Dermatologist", query: "dermatologist" },
  Urinary: { label: "Urologist", query: "urologist" },
  Metabolic: { label: "Endocrinologist", query: "endocrinologist diabetes clinic" },
  "Mental health": { label: "Psychiatrist / counsellor", query: "psychiatrist" },
  Systemic: { label: "General physician", query: "general physician" }
};

/** Returns the specialist suggestion for a saved result, or null. */
export function specialistForResult(result) {
  if (!result) return null;
  if (result.risk === "emergency") return { label: "Emergency department", query: "emergency hospital", emergency: true };
  const top = (result.categories ?? []).find((c) => CATEGORY_SPECIALIST[c.category]);
  const base = top ? CATEGORY_SPECIALIST[top.category] : CATEGORY_SPECIALIST.Systemic;
  return { ...base, category: top?.category ?? "General" };
}
