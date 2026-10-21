import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Brain,
  Camera,
  ClipboardList,
  Clock3,
  HeartPulse,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/Disclaimer";
import heroImage from "@/assets/home-hero.jpg";

const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Symptoms Detector \u2014 AI-Powered Symptom Checker" },
      {
        name: "description",
        content:
          "Describe your symptoms in plain language and receive AI-powered health insights, risk levels and educational recommendations. Not a medical diagnosis."
      },
      { property: "og:title", content: "AI Symptoms Detector \u2014 AI-Powered Symptom Checker" },
      {
        property: "og:description",
        content: "Describe your symptoms and receive AI-powered health insights, risk levels and recommendations."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ]
  }),
  component: Landing
});

const HERO_STATS = [
  { value: "210+", label: "Symptoms understood" },
  { value: "~4 min", label: "Full assessment" },
  { value: "4-tier", label: "Risk triage" },
  { value: "On-device", label: "Private history" }
];

const STEPS = [
  {
    icon: ClipboardList,
    title: "Tell us how you feel",
    text: "Describe your symptoms in your own words, or quick-pick from a guided list of body areas."
  },
  {
    icon: Brain,
    title: "AI reviews the details",
    text: "Duration, severity and history are weighed against clinical patterns, with red-flag screening built in."
  },
  {
    icon: HeartPulse,
    title: "Act with clarity",
    text: "Get a structured overview: possible explanations, urgency, and what to discuss with a clinician."
  }
];

const FEATURES = [
  {
    icon: Brain,
    title: "Natural language input",
    text: "Describe how you feel in your own words \u2014 duration, severity and all."
  },
  {
    icon: HeartPulse,
    title: "Risk triage",
    text: "Low, moderate, high or emergency, with instant escalation for red-flag symptoms."
  },
  {
    icon: ClipboardList,
    title: "Actionable summary",
    text: "Possible conditions, recommendations and tests to discuss with a clinician."
  },
  {
    icon: Lock,
    title: "Private by design",
    text: "Assessments are stored locally in your browser, never uploaded."
  }
];

const QUICK_LINKS = [
  {
    icon: Camera,
    to: "/image-analysis",
    title: "Analyze an image",
    text: "Upload a photo of a rash, wound or visible symptom for educational insights.",
    cta: "Open image analysis"
  },
  {
    icon: MapPin,
    to: "/nearby",
    title: "Nearby care",
    text: "Find doctors, specialists and emergency departments matched to your symptoms.",
    cta: "Find care near me"
  },
  {
    icon: Clock3,
    to: "/history",
    title: "Your history",
    text: "Revisit past assessments, track changes over time and export a summary.",
    cta: "View history"
  }
];

function Landing() {
  return (
    <div className="kinetic-page mx-auto max-w-6xl px-4 py-8 sm:px-7 sm:py-12">
      {/* Hero */}
      <section className="grid items-center gap-10 pb-12 pt-4 sm:pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="relative">
          <span className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur">
            <ShieldCheck className="size-3.5 text-teal" aria-hidden="true" />
            Private, educational health guidance
          </span>
          <h1 className="display-title animate-fade-up mt-6 text-[clamp(2rem,4.4vw,3.1rem)]">
            Clarity for the moments when your health feels uncertain.
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            style={{ animationDelay: "80ms" }}
          >
            Describe what feels different and receive a structured, safety-aware overview in minutes
            — so you know what to watch, what to ask, and where to go next.
          </p>
          <div className="animate-fade-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: "160ms" }}>
            <Button asChild size="lg" className="kinetic-button kinetic-button--gold min-h-12 px-7 text-base">
              <Link to="/assessment">
                <Activity className="size-5" aria-hidden="true" />
                Start Assessment
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="kinetic-button min-h-12 px-7 text-base">
              <Link to="/image-analysis">
                <Camera className="size-5" aria-hidden="true" />
                Analyze an image
              </Link>
            </Button>
          </div>
          <dl
            className="animate-fade-up mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4"
            style={{ animationDelay: "240ms" }}
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="bg-card/80 px-3 py-4 backdrop-blur sm:px-4">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display whitespace-nowrap text-lg font-semibold text-foreground sm:text-xl">{stat.value}</dd>
                <dd className="mt-1 text-[0.62rem] font-semibold uppercase tracking-normal text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="animate-fade-up relative" style={{ animationDelay: "120ms" }}>
          <div className="home-hero__glow" aria-hidden="true" />
          <div className="home-hero__frame">
            <img
              src={heroImage}
              alt="A doctor reviewing a health assessment on a tablet in a modern clinic"
              className="home-hero__img"
              width={1440}
              height={1040}
              loading="eager"
            />
            <div className="home-hero__chip home-hero__chip--a glass-panel" aria-hidden="true">
              <Sparkles className="size-4 text-teal" />
              <div>
                <strong>AI reviewed</strong>
                <span>with safety screening</span>
              </div>
            </div>
            <div className="home-hero__chip home-hero__chip--b glass-panel" aria-hidden="true">
              <Lock className="size-4 text-teal" />
              <div>
                <strong>Private</strong>
                <span>history stays on device</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border py-10 sm:py-14" aria-labelledby="how-heading">
        <p className="eyebrow">How it works</p>
        <h2 id="how-heading" className="section-title mt-3 text-2xl sm:text-3xl">
          Three steps to a clearer picture
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="animate-fade-up kinetic-panel group relative p-6 transition-transform duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="home-step__num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="kinetic-icon">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="section-title mt-4 text-lg">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Feature grid */}
      <section className="py-10 sm:py-14" aria-labelledby="features-heading">
        <p className="eyebrow">What you get</p>
        <h2 id="features-heading" className="section-title mt-3 text-2xl sm:text-3xl">
          Built for informed next steps
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              className="animate-fade-up glass-panel group p-5 transition-all duration-300 hover:-translate-y-1 hover:border-teal/40"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className="kinetic-icon transition-transform duration-300 group-hover:scale-110">
                <f.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="section-title mt-4 text-lg">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="pb-10 sm:pb-14" aria-labelledby="quick-heading">
        <p className="eyebrow">Explore</p>
        <h2 id="quick-heading" className="section-title mt-3 text-2xl sm:text-3xl">
          Beyond the assessment
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {QUICK_LINKS.map((card, i) => (
            <Link
              key={card.to}
              to={card.to}
              className="animate-fade-up glass-panel group flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="kinetic-icon transition-transform duration-300 group-hover:scale-110">
                <card.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="section-title mt-4 text-lg">{card.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{card.text}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
                <Stethoscope className="size-4" aria-hidden="true" />
                {card.cta}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <Disclaimer />
        </div>
      </section>
    </div>
  );
}

export { Route };
