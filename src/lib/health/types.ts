export type Gender = "female" | "male" | "other";

export type RiskLevel = "low" | "moderate" | "high" | "emergency";

export interface Profile {
  age: string;
  gender: Gender | "";
  heightCm: string;
  weightKg: string;
}

export interface Extras {
  duration: "" | "<24h" | "1-3d" | "4-7d" | ">1w";
  pain: number;
  temperature: string;
  recentTravel: boolean;
  sickContact: boolean;
  smoker: boolean;
  alcohol: boolean;
}

export interface AssessmentInput {
  profile: Profile;
  history: string[];
  symptoms: string;
  extras: Extras;
}

export interface Condition {
  name: string;
  confidence: number;
  explanation: string;
  commonSymptoms: string[];
  treatment: string;
}

export interface CategoryScore {
  category: string;
  value: number;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  input: AssessmentInput;
  risk: RiskLevel;
  emergency: boolean;
  healthScore: number;
  conditions: Condition[];
  recommendations: string[];
  tests: string[];
  categories: CategoryScore[];
  matchedSymptoms: string[];
}
