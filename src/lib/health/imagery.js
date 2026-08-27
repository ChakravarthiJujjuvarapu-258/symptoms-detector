import respiratory from "@/assets/conditions/respiratory.jpg";
import digestive from "@/assets/conditions/digestive.jpg";
import cardiac from "@/assets/conditions/cardiac.jpg";
import neuro from "@/assets/conditions/neuro.jpg";
import musculoskeletal from "@/assets/conditions/musculoskeletal.jpg";
import skin from "@/assets/conditions/skin.jpg";
import infection from "@/assets/conditions/infection.jpg";
import general from "@/assets/conditions/general.jpg";

const GROUPS = [
  {
    key: "respiratory",
    image: respiratory,
    alt: "Illustration of lungs and airways",
    specialist: "Pulmonologist (lung specialist)",
    keywords: ["asthma", "bronch", "pneumon", "cough", "sinus", "respirat", "copd", "throat", "flu", "cold", "covid", "breath"]
  },
  {
    key: "cardiac",
    image: cardiac,
    alt: "Illustration of a heart with an ECG line",
    specialist: "Cardiologist (heart specialist)",
    keywords: ["heart", "cardi", "angina", "chest pain", "blood pressure", "hypertens", "palpitat"]
  },
  {
    key: "neurological",
    image: neuro,
    alt: "Illustration of a brain and nerve pathways",
    specialist: "Neurologist (brain and nerve specialist)",
    keywords: ["migraine", "headache", "neuro", "stroke", "seizure", "dizz", "vertigo", "nerve"]
  },
  {
    key: "digestive",
    image: digestive,
    alt: "Illustration of the stomach and digestive tract",
    specialist: "Gastroenterologist (digestive specialist)",
    keywords: ["gastro", "stomach", "reflux", "ulcer", "diarr", "constip", "nausea", "ibs", "appendic", "liver", "food poison"]
  },
  {
    key: "musculoskeletal",
    image: musculoskeletal,
    alt: "Illustration of a joint, bone and muscle",
    specialist: "Orthopaedist or rheumatologist",
    keywords: ["arthr", "back pain", "muscle", "strain", "sprain", "joint", "fracture", "tendon"]
  },
  {
    key: "skin",
    image: skin,
    alt: "Illustration of skin layers under a magnifying glass",
    specialist: "Dermatologist (skin specialist)",
    keywords: ["derma", "rash", "eczema", "acne", "hives", "skin", "psoria", "shingles"]
  },
  {
    key: "infection",
    image: infection,
    alt: "Illustration of a virus and a thermometer",
    specialist: "General physician or infectious disease specialist",
    keywords: ["infect", "fever", "viral", "bacterial", "tonsil", "urinary", "uti", "dengue", "malaria"]
  }
];

const FALLBACK = {
  key: "general",
  image: general,
  alt: "Illustration of a stethoscope and a clipboard",
  specialist: "General physician (family doctor)"
};

function conditionVisual(condition) {
  const haystack = [
    condition?.name ?? "",
    ...(condition?.commonSymptoms ?? []),
    condition?.explanation ?? ""
  ]
    .join(" ")
    .toLowerCase();
  return GROUPS.find((g) => g.keywords.some((k) => haystack.includes(k))) ?? FALLBACK;
}

export { conditionVisual };
