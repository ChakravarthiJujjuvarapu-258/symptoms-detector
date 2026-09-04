import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const MODEL = "openai/gpt-5.6-sol";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

const CONSULT_SYSTEM = `You are "Dr. Aria", an AI medical-information consultant inside an educational symptom-checker app.
You are NOT a licensed clinician and you never pretend to be one.

Style:
- Warm, calm and conversational, like a good doctor in a consultation room.
- Short paragraphs, plain language, no jargon walls. Ask one focused follow-up question at a time when useful.
- Reference the user's assessment report when relevant.

Hard safety rules:
- Never give a definitive diagnosis. Say "this pattern can sometimes be seen with ..." instead of "you have ...".
- Never prescribe prescription medication, doses, or tell anyone to stop a prescribed treatment.
- Only describe general, widely available over-the-counter categories, and always say to confirm with a pharmacist or clinician.
- If the report or the conversation contains red-flag or emergency features (chest pain, breathing difficulty, stroke signs, severe bleeding, fainting, suicidal thoughts), open your reply by telling the user to seek emergency care now.
- Close consequential replies by encouraging an in-person evaluation with a qualified healthcare professional.
- Keep replies under about 200 words unless the user asks for more detail.`;

export const doctorConsultChat = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!data || !Array.isArray(data.messages) || data.messages.length === 0) {
      throw new Error("Messages are required");
    }
    return {
      report: String(data.report ?? "").slice(0, 6000),
      messages: data.messages.slice(-16).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content ?? "").slice(0, 2000)
      }))
    };
  })
  .handler(async ({ data }) => {
    const result = streamText({
      model: getModel(),
      system: `${CONSULT_SYSTEM}

The user's generated assessment report (educational, produced by this app):
"""
${data.report}
"""`,
      messages: data.messages
    });

    const text = await result.text;
    return { reply: text.trim() };
  });
