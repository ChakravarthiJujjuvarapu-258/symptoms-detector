import type { AnalysisResult } from "./types";

const KEY = "aisd.history.v1";

export function loadHistory(): AnalysisResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalysisResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAssessment(result: AnalysisResult): void {
  if (typeof window === "undefined") return;
  const next = [result, ...loadHistory()].slice(0, 100);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function deleteAssessment(id: string): AnalysisResult[] {
  const next = loadHistory().filter((r) => r.id !== id);
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export const LAST_RESULT_KEY = "aisd.last-result.v1";

export function setLastResult(result: AnalysisResult): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
}

export function getLastResult(): AnalysisResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(LAST_RESULT_KEY);
    return raw ? (JSON.parse(raw) as AnalysisResult) : null;
  } catch {
    return null;
  }
}
