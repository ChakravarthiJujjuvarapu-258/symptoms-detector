// Curated library of common symptoms, grouped by body area.
// Used by the assessment wizard for quick-pick chips and type-ahead suggestions.
// The free-text box + AI analysis still accept ANY symptom — this list is a convenience.

export const SYMPTOM_GROUPS = [
  {
    group: "General & whole body",
    symptoms: [
      "Fever", "Chills", "Night sweats", "Fatigue", "Weakness", "Malaise",
      "Unintentional weight loss", "Unintentional weight gain", "Loss of appetite",
      "Increased appetite", "Excessive thirst", "Dehydration", "Swollen lymph nodes",
      "Fainting", "Dizziness", "Lightheadedness", "Shivering", "Low energy",
      "Feeling hot", "Feeling cold", "General body aches", "Pale skin", "Flushed skin"
    ]
  },
  {
    group: "Head, eyes, ears, nose & throat",
    symptoms: [
      "Headache", "Migraine", "Sore throat", "Runny nose", "Blocked nose", "Sneezing",
      "Nosebleed", "Sinus pressure", "Facial pain", "Ear pain", "Ear discharge",
      "Hearing loss", "Ringing in ears", "Red eyes", "Itchy eyes", "Watery eyes",
      "Blurred vision", "Double vision", "Eye pain", "Sensitivity to light",
      "Dry mouth", "Mouth ulcers", "Bleeding gums", "Toothache", "Bad breath",
      "Hoarse voice", "Difficulty swallowing", "Swollen tonsils", "Post-nasal drip",
      "Loss of smell", "Loss of taste", "Jaw pain", "Neck stiffness", "Neck pain"
    ]
  },
  {
    group: "Chest, heart & breathing",
    symptoms: [
      "Cough", "Dry cough", "Cough with phlegm", "Coughing blood", "Shortness of breath",
      "Wheezing", "Chest pain", "Chest tightness", "Chest pressure", "Palpitations",
      "Rapid heartbeat", "Irregular heartbeat", "Pain when breathing deeply",
      "Rapid breathing", "Noisy breathing", "Unable to lie flat due to breathlessness"
    ]
  },
  {
    group: "Stomach & digestion",
    symptoms: [
      "Nausea", "Vomiting", "Vomiting blood", "Diarrhea", "Constipation", "Bloating",
      "Abdominal pain", "Upper abdominal pain", "Lower abdominal pain", "Stomach cramps",
      "Heartburn", "Acid reflux", "Indigestion", "Gas", "Belching", "Blood in stool",
      "Black tarry stool", "Pale stool", "Mucus in stool", "Painful swallowing",
      "Feeling full quickly", "Hiccups", "Rectal pain", "Anal itching", "Hemorrhoids"
    ]
  },
  {
    group: "Urinary & reproductive",
    symptoms: [
      "Painful urination", "Frequent urination", "Urgent need to urinate",
      "Blood in urine", "Dark urine", "Cloudy urine", "Reduced urine output",
      "Difficulty starting urination", "Weak urine stream", "Night-time urination",
      "Pelvic pain", "Lower back pain", "Missed period", "Heavy periods",
      "Irregular periods", "Painful periods", "Vaginal discharge", "Vaginal itching",
      "Pain during intercourse", "Testicular pain", "Testicular swelling",
      "Erectile difficulty", "Breast pain", "Breast lump", "Nipple discharge"
    ]
  },
  {
    group: "Skin, hair & nails",
    symptoms: [
      "Rash", "Itching", "Hives", "Red spots", "Blisters", "Dry skin", "Peeling skin",
      "Skin discoloration", "Yellow skin (jaundice)", "Bruising easily", "Skin lumps",
      "Mole changes", "Slow-healing wounds", "Excessive sweating", "Hair loss",
      "Brittle nails", "Nail discoloration", "Acne", "Skin swelling", "Warm skin area",
      "Skin pain", "Numb or tingling skin", "Burning sensation on skin"
    ]
  },
  {
    group: "Muscles, joints & bones",
    symptoms: [
      "Joint pain", "Joint swelling", "Joint stiffness", "Muscle pain", "Muscle cramps",
      "Muscle weakness", "Back pain", "Shoulder pain", "Knee pain", "Hip pain",
      "Leg pain", "Arm pain", "Foot pain", "Heel pain", "Swollen ankles",
      "Leg swelling", "Reduced range of motion", "Morning stiffness", "Bone pain"
    ]
  },
  {
    group: "Brain, nerves & mental health",
    symptoms: [
      "Confusion", "Memory problems", "Difficulty concentrating", "Numbness",
      "Tingling", "Tremor", "Seizures", "Loss of balance", "Poor coordination",
      "Slurred speech", "Weakness on one side", "Sleep problems", "Insomnia",
      "Excessive sleepiness", "Vivid dreams or nightmares", "Anxiety",
      "Low mood", "Irritability", "Panic attacks", "Restlessness", "Hallucinations",
      "Personality changes", "Vertigo", "Pins and needles in hands or feet"
    ]
  }
];

// Flat list for searching
export const ALL_SYMPTOMS = SYMPTOM_GROUPS.flatMap((g) =>
  g.symptoms.map((label) => ({ label, group: g.group }))
);

export function searchSymptoms(query, limit = 12) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const starts = [];
  const contains = [];
  for (const s of ALL_SYMPTOMS) {
    const l = s.label.toLowerCase();
    if (l.startsWith(q)) starts.push(s);
    else if (l.includes(q)) contains.push(s);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}
