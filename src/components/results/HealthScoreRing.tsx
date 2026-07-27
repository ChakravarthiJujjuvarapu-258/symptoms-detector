export function HealthScoreRing({ score }: { score: number }) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className="relative mx-auto grid size-40 place-items-center"
      role="img"
      aria-label={`Health score ${score} out of 100`}
    >
      <svg viewBox="0 0 160 160" className="size-40 -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" strokeWidth="12" className="stroke-muted" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-teal transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-extrabold tracking-tight">{score}</div>
        <div className="text-xs font-medium text-muted-foreground">of 100</div>
      </div>
    </div>
  );
}
