import { AlertTriangle, PhoneCall } from "lucide-react";
function EmergencyBanner() {
  return <div
    role="alert"
    className="animate-pop flex items-start gap-3 rounded-2xl border-2 border-risk-emergency bg-risk-emergency/10 p-4 sm:p-5"
  >
      <AlertTriangle className="mt-0.5 size-6 shrink-0 text-risk-emergency" aria-hidden="true" />
      <div className="min-w-0">
        <h2 className="text-base font-bold text-risk-emergency sm:text-lg">
          Possible medical emergency
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-foreground">
          Your symptoms may indicate a medical emergency. Seek immediate medical attention or call
          your local emergency services.
        </p>
        <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-risk-emergency">
          <PhoneCall className="size-3.5" aria-hidden="true" />
          Do not wait to see whether symptoms improve on their own.
        </p>
      </div>
    </div>;
}
export {
  EmergencyBanner
};
