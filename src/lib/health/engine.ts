import type { AnalysisResult, AssessmentInput, Condition, RiskLevel } from "./types";

/**
 * Local, rule-based inference engine.
 *
 * This module is intentionally isolated behind `analyzeSymptoms()` so it can be
 * swapped for a remote provider (OpenAI / Gemini / Claude / medical knowledge
 * APIs / EHR lookups) without touching any UI code. Keep the return contract
 * (`AnalysisResult`) stable when integrating a real model.
 */

export const EMERGENCY_KEYWORDS = [
  "chest pain",
  "difficulty breathing",
  "shortness of breath",
  "can't breathe",
  "cannot breathe",
  "severe bleeding",
  "heavy bleeding",
  "unconscious",
  "unresponsive",
  "stroke",
  "seizure",
  "seizures",
  "paralysis",
  "slurred speech",
  "coughing blood",
  "suicidal",
];

interface SymptomDef {
  key: string;
  label: string;
  category: string;
  aliases: string[];
  weight: number;
}

const SYMPTOMS: SymptomDef[] = [
  { key: "fever", label: "Fever", category: "Systemic", aliases: ["fever", "temperature", "chills", "feverish"], weight: 2 },
  { key: "cough", label: "Cough", category: "Respiratory", aliases: ["cough", "coughing"], weight: 2 },
  { key: "sore_throat", label: "Sore throat", category: "Respiratory", aliases: ["sore throat", "throat pain", "swallow"], weight: 1 },
  { key: "runny_nose", label: "Runny nose", category: "Respiratory", aliases: ["runny nose", "congestion", "stuffy", "sneezing", "blocked nose"], weight: 1 },
  { key: "breathless", label: "Breathlessness", category: "Respiratory", aliases: ["difficulty breathing", "shortness of breath", "breathless", "wheez"], weight: 4 },
  { key: "headache", label: "Headache", category: "Neurological", aliases: ["headache", "migraine", "head pain"], weight: 1 },
  { key: "dizziness", label: "Dizziness", category: "Neurological", aliases: ["dizzy", "dizziness", "lightheaded", "vertigo", "fainting"], weight: 2 },
  { key: "fatigue", label: "Fatigue", category: "Systemic", aliases: ["fatigue", "tired", "exhaust", "weak", "weakness"], weight: 1 },
  { key: "body_ache", label: "Body aches", category: "Musculoskeletal", aliases: ["body ache", "muscle", "joint pain", "aching", "back pain"], weight: 1 },
  { key: "nausea", label: "Nausea / vomiting", category: "Digestive", aliases: ["nausea", "vomit", "sick to my stomach", "throwing up"], weight: 2 },
  { key: "diarrhea", label: "Diarrhea", category: "Digestive", aliases: ["diarrhea", "diarrhoea", "loose stool", "stomach upset"], weight: 2 },
  { key: "abdominal", label: "Abdominal pain", category: "Digestive", aliases: ["abdominal", "stomach pain", "belly pain", "cramps"], weight: 2 },
  { key: "chest_pain", label: "Chest pain", category: "Cardiac", aliases: ["chest pain", "chest tightness", "chest pressure"], weight: 5 },
  { key: "palpitations", label: "Palpitations", category: "Cardiac", aliases: ["palpitation", "racing heart", "heart pounding", "irregular heartbeat"], weight: 3 },
  { key: "rash", label: "Rash", category: "Skin", aliases: ["rash", "hives", "itchy skin", "spots"], weight: 1 },
  { key: "urinary", label: "Urinary symptoms", category: "Urinary", aliases: ["urin", "burning when", "peeing", "bladder"], weight: 2 },
  { key: "thirst", label: "Excessive thirst", category: "Metabolic", aliases: ["thirst", "frequent urination", "dry mouth"], weight: 2 },
  { key: "taste_loss", label: "Loss of taste or smell", category: "Systemic", aliases: ["loss of taste", "loss of smell", "can't taste", "cant smell"], weight: 3 },
  { key: "swelling", label: "Swelling", category: "Systemic", aliases: ["swelling", "swollen", "edema"], weight: 2 },
  { key: "anxiety", label: "Anxiety / stress", category: "Mental health", aliases: ["anxiety", "anxious", "panic", "stress", "depress"], weight: 1 },
];

interface ConditionDef {
  name: string;
  triggers: string[];
  boost?: string[];
  explanation: string;
  commonSymptoms: string[];
  treatment: string;
  tests: string[];
  severity: number; // 0-4 contribution to risk
}

const CONDITIONS: ConditionDef[] = [
  {
    name: "Common cold (viral upper respiratory infection)",
    triggers: ["runny_nose", "sore_throat", "cough"],
    explanation: "A mild viral infection of the nose and throat that usually resolves on its own within 7–10 days.",
    commonSymptoms: ["Runny or blocked nose", "Sneezing", "Sore throat", "Mild cough"],
    treatment: "Rest, fluids, saline rinses and over-the-counter symptom relief. Antibiotics do not help viral colds.",
    tests: ["No testing usually required"],
    severity: 0,
  },
  {
    name: "Influenza (flu)",
    triggers: ["fever", "body_ache", "cough", "fatigue"],
    boost: ["headache", "sore_throat"],
    explanation: "A viral illness that typically starts abruptly with fever, muscle aches and marked fatigue.",
    commonSymptoms: ["Sudden fever", "Muscle aches", "Dry cough", "Severe tiredness"],
    treatment: "Rest, fluids and fever control. Antiviral medicine may help if started early, especially for higher-risk people.",
    tests: ["Influenza Test", "CBC"],
    severity: 1,
  },
  {
    name: "COVID-19 or similar viral infection",
    triggers: ["fever", "cough", "taste_loss"],
    boost: ["fatigue", "sore_throat", "breathless"],
    explanation: "A respiratory viral infection with a wide range of severity; loss of taste or smell is a suggestive feature.",
    commonSymptoms: ["Fever", "Cough", "Loss of taste or smell", "Fatigue"],
    treatment: "Isolation where appropriate, rest, fluids and monitoring of oxygen levels. Seek care if breathing worsens.",
    tests: ["COVID Test", "CBC", "Chest X-ray"],
    severity: 2,
  },
  {
    name: "Acute bronchitis or lower respiratory infection",
    triggers: ["cough", "breathless"],
    boost: ["fever", "fatigue"],
    explanation: "Inflammation or infection of the airways that causes a persistent cough, sometimes with breathlessness.",
    commonSymptoms: ["Persistent cough", "Chest congestion", "Wheezing", "Low-grade fever"],
    treatment: "Supportive care and inhalers where prescribed. Medical review is advised if breathing becomes difficult.",
    tests: ["Chest X-ray", "CBC"],
    severity: 2,
  },
  {
    name: "Asthma flare or allergic airway reaction",
    triggers: ["breathless", "rash"],
    boost: ["cough"],
    explanation: "Airway narrowing triggered by allergens, infection or irritants, causing wheeze and breathlessness.",
    commonSymptoms: ["Wheezing", "Chest tightness", "Night-time cough", "Breathlessness"],
    treatment: "Use of prescribed reliever inhalers and avoidance of triggers. Urgent care if the reliever is not helping.",
    tests: ["Chest X-ray", "Peak flow / spirometry"],
    severity: 3,
  },
  {
    name: "Gastroenteritis (stomach bug)",
    triggers: ["nausea", "diarrhea"],
    boost: ["abdominal", "fever"],
    explanation: "Irritation of the stomach and intestines, usually viral or food-related, causing vomiting and diarrhea.",
    commonSymptoms: ["Nausea", "Vomiting", "Diarrhea", "Cramping abdominal pain"],
    treatment: "Oral rehydration, small bland meals and rest. Seek care for signs of dehydration or blood in stool.",
    tests: ["Stool analysis", "CBC"],
    severity: 1,
  },
  {
    name: "Urinary tract infection",
    triggers: ["urinary"],
    boost: ["fever", "abdominal"],
    explanation: "A bacterial infection of the bladder or urinary tract causing burning and frequent urination.",
    commonSymptoms: ["Burning on urination", "Frequent urge to urinate", "Lower abdominal discomfort"],
    treatment: "Fluids and, where confirmed, a clinician-prescribed antibiotic course.",
    tests: ["Urine Analysis", "CBC"],
    severity: 1,
  },
  {
    name: "Migraine or tension headache",
    triggers: ["headache"],
    boost: ["nausea", "dizziness", "anxiety"],
    explanation: "A common primary headache disorder, often with light sensitivity, nausea or a tight band-like pain.",
    commonSymptoms: ["Throbbing or pressing head pain", "Light sensitivity", "Nausea"],
    treatment: "Rest in a quiet dark room, hydration and simple analgesia. Persistent patterns deserve medical review.",
    tests: ["No routine testing", "Blood pressure check"],
    severity: 0,
  },
  {
    name: "Possible blood sugar imbalance",
    triggers: ["thirst", "fatigue"],
    boost: ["dizziness", "urinary"],
    explanation: "Excessive thirst, frequent urination and tiredness can reflect poorly controlled blood glucose.",
    commonSymptoms: ["Thirst", "Frequent urination", "Fatigue", "Blurred vision"],
    treatment: "Blood glucose testing and review of diet, medication and monitoring with a clinician.",
    tests: ["Blood Sugar", "HbA1c", "Urine Analysis"],
    severity: 2,
  },
  {
    name: "Cardiac-related symptoms requiring urgent evaluation",
    triggers: ["chest_pain"],
    boost: ["breathless", "palpitations", "dizziness", "swelling"],
    explanation: "Chest discomfort with breathlessness or palpitations can have a cardiac cause and must be evaluated urgently.",
    commonSymptoms: ["Chest pain or pressure", "Breathlessness", "Palpitations", "Sweating"],
    treatment: "Immediate in-person assessment. Do not self-manage chest pain at home.",
    tests: ["ECG", "Chest X-ray", "Cardiac blood tests"],
    severity: 4,
  },
  {
    name: "Anxiety-related physical symptoms",
    triggers: ["anxiety", "palpitations"],
    boost: ["dizziness", "fatigue"],
    explanation: "Stress and anxiety can produce very real physical symptoms once medical causes have been excluded.",
    commonSymptoms: ["Racing heart", "Restlessness", "Shallow breathing", "Poor sleep"],
    treatment: "Breathing techniques, sleep and caffeine review, and talking therapies where symptoms persist.",
    tests: ["ECG", "Thyroid function"],
    severity: 1,
  },
  {
    name: "Allergic reaction",
    triggers: ["rash"],
    boost: ["swelling", "runny_nose"],
    explanation: "An immune reaction to an allergen causing skin changes, itching and sometimes swelling.",
    commonSymptoms: ["Itchy rash or hives", "Swelling", "Sneezing", "Watery eyes"],
    treatment: "Avoid the suspected trigger; antihistamines may help. Any facial or throat swelling is an emergency.",
    tests: ["Allergy panel", "CBC"],
    severity: 2,
  },
];

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function detectEmergency(text: string): string[] {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.filter((k) => lower.includes(k));
}

export function analyzeSymptoms(input: AssessmentInput): AnalysisResult {
  const text = input.symptoms.toLowerCase();
  const matched = SYMPTOMS.filter((s) => s.aliases.some((a) => text.includes(a)));
  const matchedKeys = new Set(matched.map((s) => s.key));

  const emergencyHits = detectEmergency(text);
  const emergency = emergencyHits.length > 0;

  // Score conditions
  const scored = CONDITIONS.map((c) => {
    const hits = c.triggers.filter((t) => matchedKeys.has(t)).length;
    const boosts = (c.boost ?? []).filter((t) => matchedKeys.has(t)).length;
    const base = hits / c.triggers.length;
    const score = base * 70 + boosts * 8;
    return { def: c, score };
  })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const age = Number(input.profile.age) || 0;
  const temp = Number(input.extras.temperature) || 0;

  let riskPoints = 0;
  riskPoints += matched.reduce((sum, s) => sum + s.weight, 0) * 0.6;
  riskPoints += scored.reduce((max, s) => Math.max(max, s.def.severity), 0) * 2;
  riskPoints += input.extras.pain >= 8 ? 4 : input.extras.pain >= 5 ? 2 : 0;
  riskPoints += input.extras.duration === ">1w" ? 2 : input.extras.duration === "4-7d" ? 1 : 0;
  if (temp >= 39.5 || (temp >= 103 && temp < 110)) riskPoints += 3;
  else if (temp >= 38 && temp < 45) riskPoints += 1.5;
  if (age >= 65 || (age > 0 && age < 2)) riskPoints += 2;
  const chronic = input.history.filter((h) => h !== "None").length;
  riskPoints += chronic * 1.2;
  if (input.extras.smoker) riskPoints += 1;
  if (input.extras.sickContact) riskPoints += 0.5;
  if (input.extras.recentTravel) riskPoints += 0.5;

  let risk: RiskLevel = "low";
  if (emergency) risk = "emergency";
  else if (riskPoints >= 14) risk = "high";
  else if (riskPoints >= 7) risk = "moderate";

  const maxConfidence = risk === "emergency" ? 72 : 78;
  const conditions: Condition[] = scored.map((s, i) => ({
    name: s.def.name,
    confidence: Math.round(clamp(s.score - i * 6, 12, maxConfidence)),
    explanation: s.def.explanation,
    commonSymptoms: s.def.commonSymptoms,
    treatment: s.def.treatment,
  }));

  if (conditions.length === 0) {
    conditions.push({
      name: "Non-specific symptoms",
      confidence: 30,
      explanation:
        "The description did not match a clear pattern. Adding detail about location, duration and severity can improve the insight.",
      commonSymptoms: ["Varies widely"],
      treatment: "Monitor how symptoms evolve and discuss them with a clinician if they persist or worsen.",
    });
  }

  const tests = Array.from(
    new Set(scored.flatMap((s) => s.def.tests).concat(matchedKeys.has("fever") ? ["CBC"] : [])),
  ).slice(0, 7);

  const recommendations: string[] = [];
  if (risk === "emergency") {
    recommendations.push("Call your local emergency services or go to the nearest emergency department now");
    recommendations.push("Do not drive yourself if you feel faint, breathless or have chest pain");
  }
  recommendations.push("Stay well hydrated with water or oral rehydration fluids");
  recommendations.push("Prioritise rest and sleep while your body recovers");
  recommendations.push("Monitor your symptoms and note any changes in severity");
  if (risk === "high") recommendations.push("Visit urgent care today for an in-person assessment");
  if (risk === "moderate") recommendations.push("Book a doctor appointment within the next 24–48 hours");
  if (risk === "low") recommendations.push("Book a doctor appointment if symptoms persist beyond a week");
  if (chronic > 0) recommendations.push("Tell your clinician about your existing medical conditions and medications");
  recommendations.push("Call emergency services immediately if symptoms become severe or you struggle to breathe");

  const categoryMap = new Map<string, number>();
  matched.forEach((s) => categoryMap.set(s.category, (categoryMap.get(s.category) ?? 0) + s.weight));
  const categories = Array.from(categoryMap, ([category, value]) => ({ category, value })).sort(
    (a, b) => b.value - a.value,
  );

  const healthScore = Math.round(clamp(100 - riskPoints * 5 - (emergency ? 25 : 0), 5, 98));

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    input,
    risk,
    emergency,
    healthScore,
    conditions,
    recommendations,
    tests: tests.length ? tests : ["No specific tests suggested"],
    categories: categories.length ? categories : [{ category: "Unclassified", value: 1 }],
    matchedSymptoms: matched.map((s) => s.label),
  };
}

export const RISK_META: Record<RiskLevel, { label: string; description: string; className: string }> = {
  low: {
    label: "Low",
    description: "Symptoms suggest a self-limiting problem that can usually be managed at home.",
    className: "bg-risk-low/15 text-risk-low border-risk-low/40",
  },
  moderate: {
    label: "Moderate",
    description: "Worth a professional review soon, particularly if symptoms do not improve.",
    className: "bg-risk-moderate/15 text-risk-moderate border-risk-moderate/40",
  },
  high: {
    label: "High",
    description: "These symptoms warrant prompt in-person medical assessment.",
    className: "bg-risk-high/15 text-risk-high border-risk-high/40",
  },
  emergency: {
    label: "Emergency",
    description: "Potentially life-threatening features detected. Seek immediate medical attention.",
    className: "bg-risk-emergency/15 text-risk-emergency border-risk-emergency/40",
  },
};
