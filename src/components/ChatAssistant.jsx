import { useEffect, useRef, useState } from "react";
import { MessageCircleHeart, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAssistant, CHAT_SUGGESTIONS } from "@/lib/health/chat";
import { aiHealthChat } from "@/lib/health/ai.functions";

const GREETING = {
  id: "greet",
  role: "assistant",
  text: "Hi! I can explain symptoms and general health topics in plain language. I share educational information only \u2014 not medical advice or diagnosis."
};
function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, thinking, open]);
  const send = async (text) => {
    const question = text.trim();
    if (!question || thinking) return;
    const history = [...messages, { id: `${Date.now()}-u`, role: "user", text: question }];
    setMessages(history);
    setInput("");
    setThinking(true);
    let reply = "";
    try {
      const res = await aiHealthChat({
        data: {
          messages: history
            .filter((m) => m.id !== "greet")
            .map((m) => ({ role: m.role, content: m.text }))
        }
      });
      reply = res?.reply ?? "";
    } catch (error) {
      console.error("AI chat failed, using offline answers", error);
    }
    setMessages((m) => [
      ...m,
      { id: `${Date.now()}-a`, role: "assistant", text: reply || askAssistant(question) }
    ]);
    setThinking(false);
  };

  return <>
      <Button
    onClick={() => setOpen((o) => !o)}
    aria-expanded={open}
    aria-controls="health-assistant-panel"
    aria-label={open ? "Close health assistant" : "Open health assistant"}
    className="fixed bottom-5 right-5 z-50 size-14 rounded-full clinical-gradient text-primary-foreground shadow-lg animate-pulse-ring hover:opacity-95"
  >
        {open ? <X className="size-6" aria-hidden="true" /> : <MessageCircleHeart className="size-6" aria-hidden="true" />}
      </Button>

      {open && <div
    id="health-assistant-panel"
    role="dialog"
    aria-label="Health education assistant"
    className="animate-pop fixed bottom-24 right-4 z-50 flex max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl surface-panel"
  >
          <div className="clinical-gradient px-4 py-3 text-primary-foreground">
            <p className="text-sm font-bold">Health Education Assistant</p>
            <p className="text-xs opacity-90">Educational information only</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((m) => <div
    key={m.id}
    className={m.role === "user" ? "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground" : "max-w-[92%] text-sm leading-relaxed text-foreground"}
  >
                {m.text}
              </div>)}
            {thinking && <p className="animate-fade-in text-sm text-muted-foreground">Thinking…</p>}
            <div ref={endRef} />
          </div>

          {messages.length <= 1 && <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {CHAT_SUGGESTIONS.map((s) => <button
    key={s}
    type="button"
    onClick={() => send(s)}
    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
  >
                  {s}
                </button>)}
            </div>}

          <form
    className="flex items-center gap-2 border-t border-border p-3"
    onSubmit={(e) => {
      e.preventDefault();
      send(input);
    }}
  >
            <label htmlFor="assistant-input" className="sr-only">
              Ask a health question
            </label>
            <Input
    id="assistant-input"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Ask about a symptom…"
    className="rounded-xl"
  />
            <Button
    type="submit"
    size="icon"
    aria-label="Send message"
    className="min-h-11 min-w-11 shrink-0 rounded-xl"
  >
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </div>}
    </>;
}
export {
  ChatAssistant
};
