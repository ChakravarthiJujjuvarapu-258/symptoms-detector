/**
 * Educational knowledge base for the assistant.
 *
 * Replace `askAssistant` with a call to a model provider (OpenAI / Gemini /
 * Claude) when a backend is available — the UI only depends on this signature.
 */

interface Entry {
  keywords: string[];
  answer: string;
}

const ENTRIES: Entry[] = [
  {
    keywords: ["sore throat", "throat"],
    answer:
      "A sore throat is inflammation of the pharynx, most often from a viral infection such as a cold. Warm fluids, salt-water gargles and rest usually help. Educational note: a sore throat with high fever, drooling, or difficulty swallowing or breathing needs urgent medical review.",
  },
  {
    keywords: ["fever", "temperature"],
    answer:
      "Fever is the body raising its temperature to fight infection, generally defined as 38°C (100.4°F) or above. Fluids, rest and light clothing help. Persistent fever beyond three days, fever in infants, or fever with confusion or breathlessness should be assessed by a clinician.",
  },
  {
    keywords: ["flu", "influenza", "cough and fever"],
    answer:
      "Fever with cough, body aches and sudden fatigue is a pattern often seen with influenza, but COVID-19 and other viral infections look similar. Only a clinician and, where relevant, a test can tell them apart — this app can only describe possibilities.",
  },
  {
    keywords: ["food", "eat", "diet", "nutrition", "recovery"],
    answer:
      "During recovery most people do well with fluids (water, broths, oral rehydration), easily digested carbohydrates, protein for tissue repair, and fruit or vegetables for vitamin C and zinc. Alcohol and heavy fried food tend to slow recovery. Individual needs vary — ask your clinician or a dietitian about your situation.",
  },
  {
    keywords: ["chest pain", "heart"],
    answer:
      "Chest pain is never something to self-diagnose. Educationally, it can come from the heart, lungs, muscles, or digestion — but because cardiac causes are time-critical, any new, severe, or exertion-related chest pain should be treated as an emergency and assessed immediately.",
  },
  {
    keywords: ["headache", "migraine"],
    answer:
      "Most headaches are tension-type or migraine. Hydration, regular sleep, screen breaks and managing stress reduce frequency. Red flags that need urgent care include a sudden 'worst ever' headache, headache with fever and neck stiffness, or with weakness or vision loss.",
  },
  {
    keywords: ["cough"],
    answer:
      "A cough clears the airways and commonly follows a viral infection, lasting up to three weeks. Honey and warm fluids can soothe it. A cough lasting more than three weeks, or with blood, weight loss or breathlessness, should be reviewed by a clinician.",
  },
  {
    keywords: ["breathing", "breathless", "short of breath"],
    answer:
      "Breathlessness has many causes including asthma, infection, anaemia, anxiety and heart problems. Because it can be serious, new or worsening breathlessness — especially at rest — is a reason to seek medical care right away rather than waiting.",
  },
  {
    keywords: ["diabetes", "blood sugar", "sugar"],
    answer:
      "Classic educational signs of high blood sugar are increased thirst, frequent urination, fatigue and blurred vision. Diagnosis requires blood testing (fasting glucose or HbA1c) ordered by a clinician.",
  },
  {
    keywords: ["hydration", "water", "drink"],
    answer:
      "Hydration supports temperature regulation and circulation. With fever, vomiting or diarrhea, oral rehydration solutions replace salts better than water alone. People with heart or kidney conditions should follow the fluid limits their clinician set.",
  },
  {
    keywords: ["stomach", "nausea", "vomit", "diarrhea"],
    answer:
      "Short-lived nausea and diarrhea are usually viral or food-related and settle within a few days with fluids and bland food. Warning signs include blood in stool, severe abdominal pain, signs of dehydration, or symptoms lasting more than a week.",
  },
  {
    keywords: ["sleep", "rest", "tired", "fatigue"],
    answer:
      "Rest is when most immune repair happens; 7–9 hours for adults is a common target. Ongoing fatigue that does not improve with rest can have many causes — thyroid, anaemia, mood, sleep apnoea — and is worth discussing with a clinician.",
  },
  {
    keywords: ["emergency", "911", "ambulance"],
    answer:
      "Call your local emergency number for chest pain, difficulty breathing, severe bleeding, loss of consciousness, seizures, or signs of stroke (face drooping, arm weakness, speech difficulty). Do not wait to see whether it passes.",
  },
];

const FALLBACK =
  "I can share general health education only. Try asking about a symptom (for example fever, cough, sore throat, headache, hydration or recovery foods). For anything about your own diagnosis, medication or test results, please speak with a qualified healthcare professional.";

export function askAssistant(question: string): string {
  const q = question.toLowerCase();
  const hit = ENTRIES.map((e) => ({
    e,
    score: e.keywords.reduce((s, k) => (q.includes(k) ? s + k.length : s), 0),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)[0];

  return hit ? hit.e.answer : FALLBACK;
}

export const CHAT_SUGGESTIONS = [
  "What does sore throat mean?",
  "Can fever and cough indicate flu?",
  "What foods help recovery?",
];
