import { Building2, MapPin, Phone, ExternalLink, Star, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

export function safeProviderUrl(value) {
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:" ? url.href : null; } catch { return null; }
}
export function ProviderCard({ place, selected, onSelect }) {
  const website = safeProviderUrl(place.website);
  const maps = safeProviderUrl(place.mapsUri);
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address || `${place.lat},${place.lng}`)}&destination_place_id=${encodeURIComponent(place.id)}`;
  const hospital = place.types?.includes("hospital");
  return <article className={`rounded-lg border bg-card p-4 transition-colors ${selected ? "border-primary ring-1 ring-primary" : "border-border"}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0"><p className="mb-1 flex items-center gap-1.5 text-xs text-teal"><Building2 className="size-3.5" aria-hidden="true" />{place.type || (hospital ? "Hospital" : "Healthcare provider")}</p><h3 className="break-words text-base font-semibold">{place.name}</h3></div>
      {place.distanceKm != null && <span className="shrink-0 text-sm font-semibold text-primary">{place.distanceKm.toFixed(1)} km</span>}
    </div>
    <p className="mt-2 break-words text-sm text-muted-foreground">{place.address || "Address not listed"}</p>
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      {place.rating != null ? <span className="flex items-center gap-1"><Star className="size-3.5 text-teal" aria-hidden="true" />{place.rating} {place.ratingCount != null && `(${place.ratingCount} reviews)`}</span> : <span className="text-muted-foreground">No rating listed</span>}
      <span className={place.openNow === true ? "text-risk-low" : "text-muted-foreground"}>{place.openNow == null ? "Hours not listed" : place.openNow ? "Open now" : "Closed now"}</span>
    </div>
    <p className="mt-3 text-xs text-muted-foreground">{place.emergencyListed ? "Emergency care in listing name — confirm services by phone." : "Emergency services not verified."}</p>
    <div className="mt-4 flex flex-wrap gap-2">
      <Button asChild size="sm"><a href={directions} target="_blank" rel="noopener noreferrer"><MapPin aria-hidden="true" />Get Directions</a></Button>
      {place.phone && <Button asChild size="sm" variant="outline"><a href={`tel:${place.phone.replace(/[^+\d]/g, "")}`}><Phone aria-hidden="true" />{hospital ? "Call Now" : "Call"}</a></Button>}
      <Button size="sm" variant="ghost" onClick={onSelect} aria-pressed={selected}><MapPin aria-hidden="true" />Show on map</Button>
      {(website || maps) && <Button asChild size="sm" variant="ghost"><a href={website || maps} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true" />{hospital ? "View Hospital" : "View provider"}</a></Button>}
      {!hospital && <Dialog><DialogTrigger asChild><Button size="sm" variant="outline"><CalendarClock aria-hidden="true" />Book Appointment</Button></DialogTrigger><DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg"><DialogHeader><DialogTitle>Contact {place.name}</DialogTitle><DialogDescription>Consultation availability and online booking are not verified. Contact this provider directly to arrange an appointment. No appointment is booked here.</DialogDescription></DialogHeader><div className="flex flex-wrap gap-2">{place.phone && <Button asChild><a href={`tel:${place.phone.replace(/[^+\d]/g, "")}`}><Phone aria-hidden="true" />Call provider</a></Button>}{website && <Button asChild variant="outline"><a href={website} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true" />Provider website</a></Button>}{!place.phone && !website && <p className="text-sm text-muted-foreground">No direct contact details listed. Check the provider's Google Maps listing.</p>}</div></DialogContent></Dialog>}
    </div>
  </article>;
}