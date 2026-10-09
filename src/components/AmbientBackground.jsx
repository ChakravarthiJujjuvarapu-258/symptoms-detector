export function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-bg__dots" />
      <div className="ambient-bg__orb ambient-bg__orb--a" />
      <div className="ambient-bg__orb ambient-bg__orb--b" />
      <div className="ambient-bg__orb ambient-bg__orb--c" />
      <span className="ambient-plus" style={{ left: "6%", animationDelay: "0s", animationDuration: "26s" }}>+</span>
      <span className="ambient-plus" style={{ left: "24%", animationDelay: "7s", animationDuration: "32s" }}>+</span>
      <span className="ambient-plus" style={{ left: "47%", animationDelay: "13s", animationDuration: "29s" }}>+</span>
      <span className="ambient-plus" style={{ left: "68%", animationDelay: "4s", animationDuration: "35s" }}>+</span>
      <span className="ambient-plus" style={{ left: "88%", animationDelay: "10s", animationDuration: "27s" }}>+</span>
    </div>
  );
}
