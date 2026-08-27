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

const ANALYSIS_SYSTEM = `You are a cautious medical information assistant inside an educational symptom checker.
You never diagnose. You describe possibilities in plain language and always defer to clinicians.
Reply with ONLY a JSON object, no markdown, in this exact shape:
{"conditions":[{"name":string,"confidence":number,"explanation":string,"commonSymptoms":[string],"treatment":string,
"medicines":[{"name":string,"type":string,"purpose":string}],"specialist":string,"specialistReason":string}],
"recommendations":[string],"tests":[string],"summary":string}
Rules: at most 4 conditions, confidence 5-80 (never higher, this is not a diagnosis),
at most 6 recommendations and 6 tests, each string under 240 characters.
For "medicines": at most 4 entries, generic names only (e.g. paracetamol/acetaminophen, ibuprofen, oral rehydration salts),
"type" is "over-the-counter" or "prescription only", never give doses, and never suggest prescription antibiotics as self-treatment.
For "specialist": the single most relevant kind of doctor to see (e.g. "General physician", "Pulmonologist"),
with a one-sentence "specialistReason".
If the description contains red-flag features (chest pain, breathing difficulty, stroke signs,
severe bleeding, fainting, suicidal thoughts), the first recommendation must tell the user to seek emergency care now.`;


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
    };
  })
  .handler(async ({ data }) => {
    const prompt = [
      `Reported symptoms: ${data.symptoms}`,
      `Age: ${data.profile.age ?? "unknown"}, Gender: ${data.profile.gender ?? "unknown"}`,
      `Medical history: ${data.history.length ? data.history.join(", ") : "none reported"}`,
      `Duration: ${data.extras.duration ?? "unknown"}, Pain (0-10): ${data.extras.pain ?? "unknown"}, Temperature: ${data.extras.temperature || "not measured"}`,
      `Smoker: ${data.extras.smoker ? "yes" : "no"}, Recent travel: ${data.extras.recentTravel ? "yes" : "no"}, Sick contact: ${data.extras.sickContact ? "yes" : "no"}`,
      `Rule-based risk estimate: ${data.risk}`,
    ].join("\n");

    const { text } = await generateText({
      model: getModel(),
      system: ANALYSIS_SYSTEM,
      prompt,
      providerOptions: { lovable: { reasoningEffort: "none" } },
    });

    const parsed = parseJson(text);
    const { enrichConditions, collectSources, lookupSymptoms } = await import(
      "@/lib/health/medline.server"
    );
    const baseConditions = (parsed.conditions ?? []).slice(0, 4).map((c) => ({
        name: String(c.name ?? "Possible condition"),
        confidence: Math.max(5, Math.min(80, Math.round(Number(c.confidence) || 20))),
        explanation: String(c.explanation ?? ""),
        commonSymptoms: (c.commonSymptoms ?? []).slice(0, 6).map(String),
        treatment: String(c.treatment ?? ""),
    }));

    const [conditions, generalRefs] = await Promise.all([
      enrichConditions(baseConditions),
      lookupSymptoms(data.symptoms),
    ]);

    return {
      conditions,
      sources: collectSources(conditions, generalRefs),
      recommendations: (parsed.recommendations ?? []).slice(0, 6).map(String),
      tests: (parsed.tests ?? []).slice(0, 6).map(String),
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
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
