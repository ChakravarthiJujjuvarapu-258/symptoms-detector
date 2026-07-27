const KEY = "aisd.history.v1";
function loadHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function saveAssessment(result) {
  if (typeof window === "undefined") return;
  const next = [result, ...loadHistory()].slice(0, 100);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
function deleteAssessment(id) {
  const next = loadHistory().filter((r) => r.id !== id);
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
const LAST_RESULT_KEY = "aisd.last-result.v1";
function setLastResult(result) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
}
function getLastResult() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(LAST_RESULT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export {
  LAST_RESULT_KEY,
  deleteAssessment,
  getLastResult,
  loadHistory,
  saveAssessment,
  setLastResult
};
