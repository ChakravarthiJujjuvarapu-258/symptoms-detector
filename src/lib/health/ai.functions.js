import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const MODEL = "openai/gpt-5.6-sol";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

function parseJson(text) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in model response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

const ANALYSIS_SYSTEM = `You are a cautious clinical-reasoning assistant inside an educational symptom checker.
You never diagnose. You describe possibilities in plain language and always defer to clinicians.

Reason like a clinician before answering (internally, do not show the reasoning):
1. Identify the key symptoms, their onset, duration, severity and pattern.
2. Weigh age, sex, medical history, vitals, exposures and lifestyle as modifiers of likelihood.
3. Build a differential: what is COMMON for this presentation first, then important "must-not-miss" causes.
4. Explicitly check red flags (chest pain, breathlessness, stroke signs, severe bleeding, fainting,
   stiff neck with fever, sudden worst-ever headache, confusion, suicidal thoughts, dehydration in the very young/old).
5. Calibrate: confidence reflects how well the reported picture fits, not how serious the condition is.

Reply with ONLY a JSON object, no markdown, in this exact shape:
{"conditions":[{"name":string,"confidence":number,"explanation":string,"matchedFeatures":[string],"againstFeatures":[string],
"commonSymptoms":[string],"treatment":string,"urgency":"self-care"|"see-doctor-soon"|"urgent"|"emergency",
"medicines":[{"name":string,"type":string,"purpose":string}],"specialist":string,"specialistReason":string}],
"riskLevel":"low"|"moderate"|"high"|"emergency","redFlags":[string],"followUpQuestions":[string],
"recommendations":[string],"tests":[string],"summary":string}

Accuracy rules:
- 2 to 4 conditions, ordered most to least likely, each with a DISTINCT confidence; the top one should not exceed
  the others by more than 35 points unless the picture is textbook-classic.
- confidence is 5-80 (never higher, this is not a diagnosis). Use 5-25 when the description is vague or too short,
  25-50 for a partial fit, 50-80 only when several specific features line up.
- "matchedFeatures": the user's reported features that support this possibility (max 5).
- "againstFeatures": features that argue against it or are missing (max 3); write "none clearly" if there are none.
- Never invent symptoms the user did not report. If key information is missing, say so in the summary and put the
  most useful 2-4 clarifying questions in "followUpQuestions".
- "riskLevel" is your own triage judgement; never set it lower than the rule-based estimate given in the prompt.
- "redFlags": specific warning signs for THIS presentation that mean the user should seek care immediately (max 5).
- "tests": investigations a clinician might reasonably consider, most informative first (max 6).
- "recommendations": concrete, actionable self-care and care-seeking steps (max 6), ordered by importance.
- Each string under 240 characters.
- "medicines": at most 4 entries, generic names only (e.g. paracetamol/acetaminophen, ibuprofen, oral rehydration salts),
  "type" is "over-the-counter" or "prescription only", never give doses, and never suggest prescription antibiotics as self-treatment.
- "specialist": the single most relevant kind of doctor to see (e.g. "General physician", "Pulmonologist"),
  with a one-sentence "specialistReason".
- If red-flag features are present, set "riskLevel":"emergency" and make the first recommendation tell the user to seek
  emergency care now.`;

const URGENCY = ["self-care", "see-doctor-soon", "urgent", "emergency"];
const RISKS = ["low", "moderate", "high", "emergency"];

function str(value, max = 240) {
  return String(value ?? "").trim().slice(0, max);
}

function strList(value, limit, max = 240) {
  return (Array.isArray(value) ? value : [])
    .slice(0, limit)
    .map((v) => str(v, max))
    .filter(Boolean);
}

export const aiAnalyzeSymptoms = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!data || typeof data.symptoms !== "string" || !data.symptoms.trim()) {
      throw new Error("Symptoms are required");
    }
    return {
      symptoms: data.symptoms.slice(0, 2000),
      profile: data.profile ?? {},
      history: Array.isArray(data.history) ? data.history.slice(0, 20) : [],
      extras: data.extras ?? {},
      risk: typeof data.risk === "string" ? data.risk : "low",
      matchedSymptoms: Array.isArray(data.matchedSymptoms)
        ? data.matchedSymptoms.slice(0, 20).map(String)
        : [],
      categories: Array.isArray(data.categories)
        ? data.categories.slice(0, 8).map((c) => String(c?.category ?? c))
        : [],
      emergency: Boolean(data.emergency),
    };
  })
  .handler(async ({ data }) => {
    const heightCm = Number(data.profile.heightCm) || 0;
    const weightKg = Number(data.profile.weightKg) || 0;
    const bmi =
      heightCm > 50 && weightKg > 5
        ? (weightKg / (heightCm / 100) ** 2).toFixed(1)
        : "unknown";

    const prompt = [
      `Reported symptoms (verbatim): ${data.symptoms}`,
      `Age: ${data.profile.age ?? "unknown"}, Gender: ${data.profile.gender ?? "unknown"}, BMI: ${bmi}`,
      `Medical history: ${data.history.length ? data.history.join(", ") : "none reported"}`,
      `Duration: ${data.extras.duration ?? "unknown"}, Pain (0-10): ${data.extras.pain ?? "unknown"}, Temperature: ${data.extras.temperature || "not measured"}`,
      `Smoker: ${data.extras.smoker ? "yes" : "no"}, Alcohol: ${data.extras.alcohol ? "yes" : "no"}, Recent travel: ${data.extras.recentTravel ? "yes" : "no"}, Sick contact: ${data.extras.sickContact ? "yes" : "no"}`,
      `Keyword engine matched: ${data.matchedSymptoms.length ? data.matchedSymptoms.join(", ") : "no clear keyword matches"}`,
      `Affected body systems (keyword engine): ${data.categories.length ? data.categories.join(", ") : "unclear"}`,
      `Rule-based risk estimate: ${data.risk}${data.emergency ? " (emergency keywords detected)" : ""}`,
      "",
      "The keyword engine is a crude helper: trust the verbatim description over it, but never rate the risk lower than the rule-based estimate.",
      "Respond with the JSON object only.",
    ].join("\n");

    async function ask(extraSystem) {
      const { text } = await generateText({
        model: getModel(),
        system: extraSystem ? `${ANALYSIS_SYSTEM}\n${extraSystem}` : ANALYSIS_SYSTEM,
        prompt,
        providerOptions: { lovable: { reasoningEffort: "none" } },
      });
      return text;
    }

    let parsed;
    try {
      parsed = parseJson(await ask());
    } catch {
      // One repair attempt: the model occasionally wraps or truncates the JSON.
      parsed = parseJson(
        await ask("Your previous reply was not valid JSON. Output ONLY the raw JSON object."),
      );
    }

    const { enrichConditions, collectSources, lookupSymptoms } = await import(
      "@/lib/health/medline.server"
    );

    const seen = new Set();
    const baseConditions = (parsed.conditions ?? [])
      .slice(0, 4)
      .map((c) => ({
        name: str(c.name ?? "Possible condition", 90),
        confidence: Math.max(5, Math.min(80, Math.round(Number(c.confidence) || 20))),
        explanation: str(c.explanation, 600),
        matchedFeatures: strList(c.matchedFeatures, 5, 120),
        againstFeatures: strList(c.againstFeatures, 3, 120),
        commonSymptoms: strList(c.commonSymptoms, 6, 120),
        treatment: str(c.treatment, 600),
        urgency: URGENCY.includes(c.urgency) ? c.urgency : "see-doctor-soon",
        medicines: (Array.isArray(c.medicines) ? c.medicines : [])
          .slice(0, 4)
          .map((m) => ({
            name: str(m?.name, 80),
            type: m?.type === "prescription only" ? "prescription only" : "over-the-counter",
            purpose: str(m?.purpose, 200),
          }))
          .filter((m) => m.name),
        specialist: str(c.specialist, 80),
        specialistReason: str(c.specialistReason, 240),
      }))
      .filter((c) => {
        const key = c.name.toLowerCase();
        if (!c.name || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.confidence - a.confidence);

    const [conditions, generalRefs] = await Promise.all([
      enrichConditions(baseConditions),
      lookupSymptoms(data.symptoms),
    ]);

    const aiRisk = RISKS.includes(parsed.riskLevel) ? parsed.riskLevel : null;
    const escalatedRisk =
      data.emergency || data.risk === "emergency"
        ? "emergency"
        : aiRisk && RISKS.indexOf(aiRisk) > RISKS.indexOf(data.risk)
          ? aiRisk
          : data.risk;

    return {
      conditions,
      sources: collectSources(conditions, generalRefs),
      recommendations: strList(parsed.recommendations, 6),
      tests: strList(parsed.tests, 6),
      redFlags: strList(parsed.redFlags, 5),
      followUpQuestions: strList(parsed.followUpQuestions, 4),
      riskLevel: escalatedRisk,
      summary: str(parsed.summary, 800),
    };
  });


const CHAT_SYSTEM = `You are a friendly health education assistant in a symptom-checker app.
Give general, evidence-informed health education in plain language, 3-6 sentences maximum.
Never diagnose, never prescribe, never interpret personal test results.
Mention relevant red flags that need urgent care, and remind the user to consult a qualified
healthcare professional for anything about their own care. Plain text, no markdown headings.`;

export const aiHealthChat = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!data || !Array.isArray(data.messages) || data.messages.length === 0) {
      throw new Error("Messages are required");
    }
    return {
      messages: data.messages.slice(-12).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content ?? "").slice(0, 2000),
      })),
    };
  })
  .handler(async ({ data }) => {
    const lastUser = [...data.messages].reverse().find((m) => m.role === "user");
    const { lookupSymptoms } = await import("@/lib/health/medline.server");

    const [{ text }, sources] = await Promise.all([
      generateText({
        model: getModel(),
        system: CHAT_SYSTEM,
        messages: data.messages,
        providerOptions: { lovable: { reasoningEffort: "none" } },
      }),
      lookupSymptoms(lastUser?.content ?? "", 3),
    ]);

    return { reply: text.trim(), sources };
  });
