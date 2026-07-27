const LEVELS = [
  { level: "low", label: "Low", color: "var(--risk-low)" },
  { level: "moderate", label: "Moderate", color: "var(--risk-moderate)" },
  { level: "high", label: "High", color: "var(--risk-high)" },
  { level: "emergency", label: "Emergency", color: "var(--risk-emergency)" }
];
function RiskGauge({ level }) {
  const index = LEVELS.findIndex((l) => l.level === level);
  const angle = -90 + (index + 0.5) * (180 / LEVELS.length);
  return <div className="w-full">
      <svg
    viewBox="0 0 200 116"
    className="w-full"
    role="img"
    aria-label={`Risk gauge: ${LEVELS[index].label}`}
  >
        {LEVELS.map((l, i) => {
    const start = Math.PI - i * Math.PI / LEVELS.length;
    const end = Math.PI - (i + 1) * Math.PI / LEVELS.length;
    const r = 78;
    const x1 = 100 + r * Math.cos(start);
    const y1 = 100 - r * Math.sin(start);
    const x2 = 100 + r * Math.cos(end);
    const y2 = 100 - r * Math.sin(end);
    return <path
      key={l.level}
      d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
      fill="none"
      stroke={l.color}
      strokeWidth="16"
      strokeLinecap="butt"
      opacity={i === index ? 1 : 0.22}
    />;
  })}
        <g
    style={{
      transform: `rotate(${angle}deg)`,
      transformOrigin: "100px 100px",
      transition: "transform 900ms cubic-bezier(0.34,1.4,0.64,1)"
    }}
  >
          <line
    x1="100"
    y1="100"
    x2="100"
    y2="38"
    stroke="var(--foreground)"
    strokeWidth="4"
    strokeLinecap="round"
  />
        </g>
        <circle cx="100" cy="100" r="7" fill="var(--foreground)" />
      </svg>
      <div className="mt-1 flex justify-between text-[0.7rem] font-medium text-muted-foreground">
        {LEVELS.map((l) => <span key={l.level}>{l.label}</span>)}
      </div>
    </div>;
}
export {
  RiskGauge
};
