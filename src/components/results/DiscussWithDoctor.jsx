import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, Download, Mail, MapPin, Send, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RISK_META } from "@/lib/health/engine";
import { exportAssessmentPdf } from "@/lib/health/export";
import { doctorConsultChat } from "@/lib/health/consult.functions";

const DEFAULT_QUESTIONS = [
  "Based on my symptoms, what are the most likely explanations?",
  "Are there any warning signs I should watch for at home?",
  "Which tests, if any, would you recommend and why?",
  "What can I safely do to relieve my symptoms in the meantime?",
  "When should I come back if things do not improve?"
];

function buildReport(result) {
  const date = new Date(result.createdAt).toLocaleString();
  return [
    "AI Symptoms Detector — summary for my doctor",
    `Generated: ${date}`,
    "",
    `Risk level (educational estimate): ${RISK_META[result.risk].label}`,
    `Health score: ${result.healthScore}/100`,
    "",
    "Reported symptoms:",
    result.input?.symptoms || "—",
    "",
    "Possible conditions suggested by the tool (not a diagnosis):",
    ...result.conditions.map((c) => `• ${c.name} — ${c.confidence}% match. ${c.explanation}`),
    "",
    "Recommendations shown to me:",
    ...(result.recommendations ?? []).map((r) => `• ${r}`),
    "",
    "Tests suggested for discussion:",
    ...(result.tests ?? []).map((t) => `• ${t}`),
    "",
    "Questions I would like to ask:",
    ...(result.followUpQuestions?.length ? result.followUpQuestions : DEFAULT_QUESTIONS).map(
      (q) => `• ${q}`
    ),
    "",
    "Note: this summary was produced by an educational AI tool and is not a medical diagnosis."
  ].join("\n");
}

function ConsultChat({ report, questions }) {
  const [messages, setMessages] = useState([
    {
      id: "greet",
      role: "assistant",
      text: "Hello, I'm Dr. Aria, an AI medical-information consultant. I've read your assessment report. Tell me what worries you most, or pick one of the questions below — I'll explain things in plain language. I can't diagnose you, so please also see a qualified clinician in person."
    }
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, thinking]);

  const send = async (raw) => {
    const question = raw.trim();
    if (!question || thinking) return;
    const next = [...messages, { id: `${Date.now()}-u`, role: "user", text: question }];
    setMessages(next);
    setInput("");
    setThinking(true);
    try {
      const res = await doctorConsultChat({
        data: {
          report,
          messages: next
            .filter((m) => m.id !== "greet")
            .map((m) => ({ role: m.role, content: m.text }))
        }
      });
      setMessages((m) => [
        ...m,
        {
          id: `${Date.now()}-a`,
          role: "assistant",
          text: res?.reply || "I couldn't generate a reply just now. Please try asking again."
        }
      ]);
    } catch (error) {
      console.error("Doctor consultation failed", error);
      toast.error(error?.message || "The consultation service is unavailable right now.");
      setMessages((m) => [
        ...m,
        {
          id: `${Date.now()}-e`,
          role: "assistant",
          text: "Sorry — I couldn't reach the consultation service. Please try again in a moment, and seek in-person care if your symptoms are worsening."
        }
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="flex h-[52vh] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border bg-surface/50 p-4" aria-live="polite">
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground"
                : "max-w-[92%] whitespace-pre-wrap text-sm leading-relaxed text-foreground"
            }
          >
            {m.text}
          </div>
        ))}
        {thinking && <p className="animate-fade-in text-sm text-muted-foreground">Dr. Aria is reviewing your report…</p>}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {questions.slice(0, 4).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="rounded-full border border-border px-2.5 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label htmlFor="consult-input" className="sr-only">
          Ask the AI doctor a question
        </label>
        <Input
          id="consult-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your report…"
          className="rounded-xl"
        />
        <Button type="submit" size="icon" aria-label="Send message" className="min-h-11 min-w-11 shrink-0 rounded-xl">
          <Send className="size-4" aria-hidden="true" />
        </Button>
      </form>

      <p className="mt-2 text-[11px] text-muted-foreground">
        Dr. Aria is an AI consultant offering educational information only — not a diagnosis,
        prescription, or a substitute for a licensed clinician.
      </p>
    </div>
  );
}

function DiscussWithDoctor({ result }) {
  const [open, setOpen] = useState(false);
  const report = useMemo(() => buildReport(result), [result]);
  const questions = result.followUpQuestions?.length ? result.followUpQuestions : DEFAULT_QUESTIONS;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      toast.success("Summary copied — paste it into a message to your doctor.");
    } catch {
      toast.error("Could not copy. Select the text and copy it manually.");
    }
  };

  const mailto = `mailto:?subject=${encodeURIComponent(
    "Symptom summary for my appointment"
  )}&body=${encodeURIComponent(report)}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl clinical-gradient text-primary-foreground hover:opacity-95">
          <Stethoscope className="size-4" aria-hidden="true" />
          Discuss With a Doctor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Discuss with a doctor</DialogTitle>
          <DialogDescription>
            Talk it through with an AI consultant that already has your report, or share the summary
            with a human clinician.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="chat">
          <TabsList className="grid w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="chat">Consultation chat</TabsTrigger>
            <TabsTrigger value="report">Report & sharing</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-4">
            <ConsultChat report={report} questions={questions} />
          </TabsContent>

          <TabsContent value="report" className="mt-4 space-y-4">
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl border border-border bg-surface/60 p-4 text-sm leading-relaxed">
              {report}
            </pre>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-xl" onClick={copy}>
                <Copy className="size-4" aria-hidden="true" />
                Copy summary
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => exportAssessmentPdf(result)}>
                <Download className="size-4" aria-hidden="true" />
                Download PDF
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <a href={mailto}>
                  <Mail className="size-4" aria-hidden="true" />
                  Email it
                </a>
              </Button>
              <Button asChild className="rounded-xl">
                <Link to="/nearby" onClick={() => setOpen(false)}>
                  <MapPin className="size-4" aria-hidden="true" />
                  Find care near me
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export { DiscussWithDoctor };
