import { describe, it, expect } from "vitest";
import { carePlanForResult, providerMatchesFilters, rankProviders } from "./specialists";
const result = (symptoms, risk = "moderate") => ({ risk, input: { symptoms }, conditions: [], categories: [] });
describe("symptom-relevant care", () => {
  for (const [symptom, specialty] of [["heart problems", "cardiology"], ["skin rash", "dermatology"], ["stomach pain", "digestive"], ["bone and joint pain", "orthopedic"], ["eye problems", "eyes"], ["fever infection", "general"]]) {
    it(`matches ${symptom}`, () => expect(carePlanForResult(result(symptom)).primary).toBe(specialty));
  }
  it("prioritizes neurology then general physicians for migraine", () => expect(carePlanForResult(result("Possible migraine / severe headache")).specialtyIds.slice(0, 2)).toEqual(["neurology", "general"]));
  it("prioritizes clinics for mild symptoms", () => expect(carePlanForResult(result("rash", "low"))).toMatchObject({ primary: "general", provider: "clinic" }));
  for (const risk of ["high", "severe", "emergency"]) it(`prioritizes emergency hospitals for ${risk}`, () => expect(carePlanForResult(result("headache", risk))).toMatchObject({ primary: "emergency", provider: "hospital", emergency: true }));
  it("preserves emergency flags even when risk differs", () => expect(carePlanForResult({ ...result("chest pain", "moderate"), emergency: true }).primary).toBe("emergency"));
  it("uses possible conditions when categories are unclassified", () => expect(carePlanForResult({ ...result("unusual discomfort"), conditions: [{ name: "Eczema" }] }).primary).toBe("dermatology"));
  it("does not invent open or emergency availability", () => expect(providerMatchesFilters({ rating: 4.8, openNow: null }, { openNow: true, emergencyOnly: true })).toBe(false));
  it("filters rating and radius", () => { expect(providerMatchesFilters({ rating: 3.9, distanceKm: 2 }, { rating: 4 })).toBe(false); expect(providerMatchesFilters({ rating: 4.9, distanceKm: 16 }, { radiusKm: 15 })).toBe(false); });
  it("sorts relevant providers first then distance", () => expect(rankProviders([{ id: "a", name: "Clinic", distanceKm: 1 }, { id: "b", name: "Neurology hospital", distanceKm: 3 }, { id: "c", name: "Neurologist", distanceKm: 2 }], "neurology").map((p) => p.id)).toEqual(["c", "b", "a"]));
});