import { createFileRoute } from "@tanstack/react-router";

const ACCEPTED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;
const MIN_BYTES = 8 * 1024;
const MODEL = "google/gemini-3.7-flash";

const INSUFFICIENT = {
  visible_features: [],
  possible_conditions: [],
  confidence: "low",
  explanation:
    "Image quality is insufficient for meaningful visual analysis. Please upload a clearer, well-lit image.",
  recommendation:
    "Retake the photo in good lighting, hold the camera steady and fill the frame with the affected area.",
  requires_professional_evaluation: true,
};

const SYSTEM = `You are a cautious medical-information assistant in an educational tool. You NEVER diagnose.
Analyse the supplied photo only for visible characteristics.
Reply with ONLY a JSON object, no markdown, in this exact shape:
{"visible_features":[{"label":string,"detail":string}],
"possible_conditions":[{"name":string,"match":"Low"|"Moderate"|"High","why":string,"common_symptoms":[string],"learn_more":string}],
"confidence":"low"|"moderate"|"high",
"explanation":string,
"recommendation":string,
"requires_professional_evaluation":true,
"image_quality":"ok"|"insufficient"}
Rules:
- If the photo is blurry, too dark, cropped oddly, or does not clearly show a body area, set "image_quality":"insufficient" and leave the arrays empty.
- At most 6 visible features (e.g. redness, swelling, scaling, spots/lesions, texture change, discoloration).
- At most 4 possible conditions; "match" is at most "Moderate" unless the visual pattern is textbook-classic.
- Never state the user has a condition. Phrase as "features that can sometimes be seen with X, but an image alone cannot determine the cause."
- Never name prescription medication or doses, never tell anyone to stop treatment.
- Explain that many different conditions can look similar.
- "learn_more" is a plain-language sentence on where to read more (e.g. MedlinePlus), not a URL claim of proof.
- Avoid graphic or frightening wording. Advise urgent in-person care if features suggest spreading infection, deep wounds, or rapid change.`;

function sanitize(raw: any) {
  const arr = (v: any) => (Array.isArray(v) ? v : []);
  const str = (v: any, max = 600) => (typeof v === "string" ? v.slice(0, max) : "");
  const match = (v: any) =>
    ["Low", "Moderate", "High"].includes(v) ? v : "Low";
  return {
    visible_features: arr(raw?.visible_features)
      .slice(0, 6)
      .map((f: any) =>
        typeof f === "string"
          ? { label: str(f, 80), detail: "" }
          : { label: str(f?.label, 80), detail: str(f?.detail, 300) },
      )
      .filter((f: any) => f.label),
    possible_conditions: arr(raw?.possible_conditions)
      .slice(0, 4)
      .map((c: any) => ({
        name: str(c?.name, 90),
        match: match(c?.match),
        why: str(c?.why, 400),
        common_symptoms: arr(c?.common_symptoms).slice(0, 6).map((s: any) => str(s, 120)),
        learn_more: str(c?.learn_more, 300),
      }))
      .filter((c: any) => c.name),
    confidence: ["low", "moderate", "high"].includes(raw?.confidence) ? raw.confidence : "low",
    explanation: str(raw?.explanation, 1200),
    recommendation: str(raw?.recommendation, 800),
    requires_professional_evaluation: true,
  };
}

function parseJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in model response");
  return JSON.parse(text.slice(start, end + 1));
}

export const Route = createFileRoute("/api/analyze-symptom-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const json = (body: unknown, status = 200) =>
          new Response(JSON.stringify(body), {
            status,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          });

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return json({ error: "Expected a multipart form upload with an 'image' field." }, 400);
        }

        const file = form.get("image");
        if (!file || typeof file === "string") {
          return json({ error: "No image was uploaded." }, 400);
        }
        const type = (file.type || "").toLowerCase();
        if (!ACCEPTED.has(type)) {
          return json({ error: "Unsupported format. Please upload a JPG, JPEG, PNG or WEBP image." }, 415);
        }
        if (file.size > MAX_BYTES) {
          return json({ error: "Image is larger than 8 MB. Please upload a smaller photo." }, 413);
        }
        if (file.size < MIN_BYTES) {
          return json(INSUFFICIENT);
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return json({ error: "AI service is not configured." }, 500);

        const buf = new Uint8Array(await file.arrayBuffer());
        let binary = "";
        for (let i = 0; i < buf.length; i += 0x8000) {
          binary += String.fromCharCode(...buf.subarray(i, i + 0x8000));
        }
        const dataUrl = `data:${type === "image/jpg" ? "image/jpeg" : type};base64,${btoa(binary)}`;

        let upstream: Response;
        try {
          upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: MODEL,
              messages: [
                { role: "system", content: SYSTEM },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: "Analyse this photo for visible characteristics only and reply with the JSON object.",
                    },
                    { type: "image_url", image_url: { url: dataUrl } },
                  ],
                },
              ],
            }),
          });
        } catch {
          return json({ error: "Could not reach the analysis service. Please try again." }, 502);
        }

        if (!upstream.ok) {
          const text = await upstream.text().catch(() => "");
          if (upstream.status === 429) {
            return json({ error: "Too many requests right now. Please wait a moment and try again." }, 429);
          }
          if (upstream.status === 402) {
            return json({ error: "AI usage credits are exhausted for this workspace." }, 402);
          }
          return json({ error: text || "Image analysis failed." }, upstream.status);
        }

        let parsed: any;
        try {
          const payload: any = await upstream.json();
          parsed = parseJson(payload?.choices?.[0]?.message?.content ?? "");
        } catch {
          return json({ error: "The analysis response could not be read. Please try again." }, 502);
        }

        if (parsed?.image_quality === "insufficient") return json(INSUFFICIENT);

        const clean = sanitize(parsed);
        if (!clean.visible_features.length && !clean.possible_conditions.length) {
          return json(INSUFFICIENT);
        }
        return json(clean);
      },
    },
  },
});
