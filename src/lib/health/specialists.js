/** Educational navigation, never a diagnosis or a verified referral. */
export const SPECIALTIES = {
  general: { label: "General physician", query: "general physician clinic", department: "general medicine" },
  cardiology: { label: "Cardiologist", query: "cardiologist", department: "cardiology" },
  respiratory: { label: "Chest specialist", query: "pulmonologist chest clinic", department: "pulmonology" },
  digestive: { label: "Gastroenterologist", query: "gastroenterologist", department: "gastroenterology" },
  neurology: { label: "Neurologist", query: "neurologist", department: "neurology" },
  orthopedic: { label: "Orthopedic doctor", query: "orthopedic doctor", department: "orthopedics" },
  dermatology: { label: "Dermatologist", query: "dermatologist", department: "dermatology" },
  eyes: { label: "Ophthalmologist", query: "ophthalmologist eye clinic", department: "ophthalmology" },
  urinary: { label: "Urologist", query: "urologist", department: "urology" },
  endocrine: { label: "Endocrinologist", query: "endocrinologist", department: "endocrinology" },
  mental: { label: "Mental health professional", query: "psychiatrist mental health clinic", department: "psychiatry" },
  emergency: { label: "Emergency departments", query: "hospital emergency department", department: "emergency medicine" }
};
const CATEGORY_IDS = { Cardiac: "cardiology", Respiratory: "respiratory", Digestive: "digestive", Neurological: "neurology", Musculoskeletal: "orthopedic", Skin: "dermatology", Urinary: "urinary", Metabolic: "endocrine", "Mental health": "mental", Systemic: "general" };
const PATTERNS = [
  ["cardiology", /\b(heart|cardiac|chest pain|palpitation|angina)\b/i],
  ["eyes", /\b(eye|eyes|vision|visual|ophthalm|conjunctivitis)\b/i],
  ["neurology", /\b(migraine|headache|neurolog|seizure|numbness)\b/i],
  ["dermatology", /\b(skin|rash|eczema|acne|dermatitis)\b/i],
  ["digestive", /\b(stomach|digestive|abdominal|gastritis|diarrhea|reflux|vomiting)\b/i],
  ["orthopedic", /\b(bone|joint|fracture|arthritis|back pain|sprain)\b/i],
  ["respiratory", /\b(breath|breathing|cough|asthma|pneumonia|respiratory)\b/i],
  ["urinary", /\b(urinary|urine|kidney|bladder)\b/i],
  ["endocrine", /\b(diabetes|thyroid|hormone|metabolic)\b/i],
  ["mental", /\b(anxiety|depression|panic|mental health)\b/i],
  ["general", /\b(fever|infection|flu|cold)\b/i]
];
export function carePlanForResult(result) {
  if (!result) return null;
  const emergency = result.emergency === true || ["high", "severe", "emergency"].includes(result.risk);
  const text = [result.input?.symptoms, ...(result.matchedSymptoms ?? []), ...(result.conditions ?? []).slice(0, 3).map((c) => c.name)].filter(Boolean).join(" ");
  const fromText = PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([id]) => id);
  const fromCategory = [...(result.categories ?? [])].sort((a, b) => (b.value ?? 0) - (a.value ?? 0)).map((c) => CATEGORY_IDS[c.category]).filter(Boolean);
  const relevant = [...new Set([...fromText, ...fromCategory])];
  const mild = ["low", "mild"].includes(result.risk);
  const ordered = [...new Set(emergency ? ["emergency", ...relevant, "general"] : mild ? ["general", ...relevant] : [relevant[0] ?? "general", "general", ...relevant])];
  return { emergency, risk: result.risk ?? "unknown", specialtyIds: ordered, primary: ordered[0], provider: emergency ? "hospital" : mild ? "clinic" : "all", reason: emergency ? "Your assessment recommends immediate in-person care." : mild ? "General physicians and clinics are prioritized for mild symptoms." : "Specialists are suggested from your symptoms and possible explanations." };
}
export function specialistForResult(result) {
  const plan = carePlanForResult(result);
  return plan ? { ...SPECIALTIES[plan.primary], emergency: plan.emergency, category: plan.primary } : null;
}
export function providerMatchesFilters(place, { rating = 0, openNow = false, emergencyOnly = false, radiusKm = 15 } = {}) {
  return (!rating || (place.rating != null && place.rating >= Number(rating))) && (!openNow || place.openNow === true) && (!emergencyOnly || place.emergencyListed === true) && (place.distanceKm == null || place.distanceKm <= radiusKm);
}
export function rankProviders(places, specialty) {
  const terms = [SPECIALTIES[specialty]?.department, SPECIALTIES[specialty]?.query?.split(" ")[0]].filter(Boolean);
  const score = (p) => terms.some((term) => `${p.name} ${p.type}`.toLowerCase().includes(term)) ? 1 : 0;
  return [...places].sort((a, b) => score(b) - score(a) || (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
}
