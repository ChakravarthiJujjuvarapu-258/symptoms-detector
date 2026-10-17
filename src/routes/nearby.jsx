import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Crosshair, MapPin, Search, Siren, Stethoscope, HeartPulse, RotateCcw, ChevronRight } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ProviderCard } from "@/components/nearby/ProviderCard";
import { findNearbyHealthcare, geocodeLocation, searchHealthcareText } from "@/lib/health/places.functions";
import { getLastResult, loadHistory } from "@/lib/health/storage";
import { SPECIALTIES, carePlanForResult, providerMatchesFilters, rankProviders } from "@/lib/health/specialists";

const TITLE = "Nearby Care — AI Symptoms Detector";
const DESCRIPTION = "Find real doctors, specialists and hospitals near you, suggested from your symptoms and assessment urgency.";
export const Route = createFileRoute("/nearby")({
  head: () => ({ meta: [{ title: TITLE }, { name: "description", content: DESCRIPTION }, { property: "og:title", content: TITLE }, { property: "og:description", content: DESCRIPTION }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: NearbyPage
});
const MAPS_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
const DISCLAIMER = "Your symptoms may have several possible causes. These results are for informational purposes only and are not a medical diagnosis. Please consult a qualified healthcare professional for proper evaluation.";

function NearbyPage() {
  const nearby = useServerFn(findNearbyHealthcare);
  const geocode = useServerFn(geocodeLocation);
  const textSearch = useServerFn(searchHealthcareText);
  const [assessment, setAssessment] = useState(null);
  const [specialty, setSpecialty] = useState("general");
  const [provider, setProvider] = useState("all");
  const [coords, setCoords] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [locationSource, setLocationSource] = useState("gps");
  const [locationLabel, setLocationLabel] = useState("");
  const [area, setArea] = useState("");
  const [areas, setAreas] = useState([]);
  const [searchingArea, setSearchingArea] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [places, setPlaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [radius, setRadius] = useState("15");
  const [rating, setRating] = useState("0");
  const [openNow, setOpenNow] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const gps = useRef(null);
  const areaVersion = useRef(0);
  const cache = useRef(new Map());
  const plan = useMemo(() => carePlanForResult(assessment), [assessment]);

  useEffect(() => {
    const update = () => {
      const result = getLastResult() ?? loadHistory()[0] ?? null;
      const nextPlan = carePlanForResult(result);
      setAssessment(result);
      setSpecialty(nextPlan?.primary ?? "general");
      setProvider(nextPlan?.provider ?? "all");
    };
    update();
    window.addEventListener("assessment-updated", update);
    window.addEventListener("storage", update);
    return () => { window.removeEventListener("assessment-updated", update); window.removeEventListener("storage", update); };
  }, []);
  const stopGps = useCallback(() => { gps.current?.(); gps.current = null; }, []);
  const locate = useCallback(() => {
    stopGps();
    areaVersion.current += 1;
    setAreas([]);
    setLocationError("");
    if (!navigator.geolocation) { setLocationError("Location is not supported. Search your city or area instead."); return; }
    setLocating(true);
    let best = null;
    let done = false;
    let watchId;
    let timer;
    const stop = () => { done = true; if (watchId != null) navigator.geolocation.clearWatch(watchId); clearTimeout(timer); };
    gps.current = stop;
    const finish = (message) => {
      if (done) return;
      stop();
      setLocating(false);
      if (!best) { setLocationError(message || "Could not locate you. Search your city or area instead."); return; }
      const acc = Math.round(best.coords.accuracy);
      setAccuracy(acc);
      if (acc > 2000) { setCoords(null); setLocationError("Your location is too imprecise. Search your area for accurate results."); return; }
      setCoords({ lat: best.coords.latitude, lng: best.coords.longitude });
      setLocationSource("gps");
      setLocationLabel("Your current location");
      if (acc > 500) setLocationError("Your GPS location is approximate. Search your area to improve it.");
    };
    watchId = navigator.geolocation.watchPosition((position) => {
      if (done) return;
      if (!best || position.coords.accuracy < best.coords.accuracy) { best = position; setAccuracy(Math.round(position.coords.accuracy)); }
      if (best.coords.accuracy <= 30) finish();
    }, () => finish("Location access is unavailable. Allow location access or search your area."), { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
    timer = setTimeout(() => finish(), 20000);
  }, [stopGps]);
  useEffect(() => { locate(); return stopGps; }, [locate, stopGps]);
  const pickArea = useCallback((item) => {
    stopGps();
    setLocating(false);
    setCoords({ lat: item.lat, lng: item.lng });
    setLocationSource("manual");
    setLocationLabel(item.label);
    setAccuracy(null);
    setArea(item.label);
    setAreas([]);
    setLocationError("");
  }, [stopGps]);
  const searchArea = async (event) => {
    event.preventDefault();
    if (area.trim().length < 3) { setLocationError("Enter at least 3 characters for your city, area or pincode."); return; }
    const version = ++areaVersion.current;
    stopGps(); setLocating(false); setSearchingArea(true); setLocationError(""); setAreas([]);
    try {
      const response = await geocode({ data: { query: area.trim() } });
      if (version !== areaVersion.current) return;
      if (response.unavailable) setLocationError(response.message);
      else if (response.results?.length === 1) pickArea(response.results[0]);
      else { setAreas(response.results ?? []); if (!response.results?.length) setLocationError(response.message || "No matching area. Try a more specific address."); }
    } catch (err) { if (version === areaVersion.current) setLocationError(err.message || "Area search failed."); }
    finally { if (version === areaVersion.current) setSearchingArea(false); }
  };

  useEffect(() => {
    if (!coords) { setPlaces([]); return; }
    let active = true;
    const key = JSON.stringify({ coords, specialty, provider, radius, refresh });
    setSelected(null); setPlaces([]); setError("");
    const cached = cache.current.get(key);
    if (cached && Date.now() - cached.time < 300000) { setPlaces(cached.places); setLoading(false); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = provider === "pharmacy"
          ? await nearby({ data: { ...coords, category: "pharmacy", radius: Number(radius) * 1000 } })
          : await textSearch({ data: { ...coords, query: provider === "hospital" && specialty !== "emergency" ? `${SPECIALTIES[specialty].department} hospital` : SPECIALTIES[specialty].query, provider, radius: Number(radius) * 1000 } });
        if (!active) return;
        if (response.unavailable) { setError(response.message); return; }
        const unique = [...new Map((response.places ?? []).map((p) => [p.id, p])).values()];
        cache.current.set(key, { time: Date.now(), places: unique });
        if (cache.current.size > 20) cache.current.delete(cache.current.keys().next().value);
        setPlaces(unique);
      } catch (err) { if (active) setError(err.message || "Unable to find providers. Please try again."); }
      finally { if (active) setLoading(false); }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [coords, specialty, provider, radius, refresh, nearby, textSearch]);
  const filtered = useMemo(() => rankProviders(places.filter((p) => providerMatchesFilters(p, { rating: Number(rating), openNow, emergencyOnly, radiusKm: Number(radius) })), specialty), [places, rating, openNow, emergencyOnly, radius, specialty]);
  const selectedPlace = filtered.find((p) => p.id === selected);
  const mapUrl = MAPS_KEY && coords ? selectedPlace
    ? `https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=place_id:${encodeURIComponent(selectedPlace.id)}`
    : `https://www.google.com/maps/embed/v1/view?key=${MAPS_KEY}&center=${coords.lat},${coords.lng}&zoom=13` : null;
  const selectOptions = [...new Set([...(plan?.specialtyIds ?? []), ...Object.keys(SPECIALTIES)])];

  return <div className="kinetic-page mx-auto max-w-6xl space-y-6 px-4 py-7 sm:px-7 sm:py-10">
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground"><Link to="/">Overview</Link><ChevronRight className="size-3" aria-hidden="true" /><span>Nearby Care</span></nav>
    <header><p className="eyebrow">The next step in your care</p><h1 className="display-title mt-2">Nearby Care</h1><p className="mt-3 text-base text-muted-foreground">Healthcare recommendations based on your symptoms</p></header>
    {plan?.emergency && <section role="alert" className="border-l-4 border-risk-emergency bg-risk-emergency/10 p-5"><h2 className="flex items-start gap-2 text-lg font-semibold text-risk-emergency"><Siren className="mt-0.5 size-5 shrink-0" aria-hidden="true" />Emergency – Seek Immediate Medical Attention</h2><p className="mt-2 text-sm">Your assessment indicates severe or potentially emergency symptoms. Seek immediate in-person care. For life-threatening symptoms, call your local emergency number now. Do not wait for search results or an appointment.</p><p className="mt-2 text-xs text-muted-foreground">Hospital emergency services must be confirmed directly; a nearby listing is not a guarantee of emergency capability.</p></section>}
    {assessment ? <section aria-label="Assessment summary" className="border-y border-border py-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="eyebrow">Based on your latest assessment</p><Button asChild size="sm" variant="ghost"><Link to="/assessment">New assessment<ChevronRight aria-hidden="true" /></Link></Button></div><div className="mt-3 grid gap-4 sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">Possible explanation — not a diagnosis</p><h2 className="mt-1 text-lg font-semibold">{assessment.conditions?.[0]?.name || "Symptoms need professional evaluation"}</h2><p className="mt-2 line-clamp-3 break-words text-sm text-muted-foreground">{assessment.matchedSymptoms?.length ? assessment.matchedSymptoms.slice(0, 6).join(" · ") : assessment.input?.symptoms || "Assessment recorded"}</p></div><div><p className="text-sm font-semibold">Assessment urgency: {plan.emergency ? "Immediate care" : plan.risk === "low" ? "Low" : plan.risk === "moderate" ? "Moderate" : "Not specified"}</p><p className="mt-2 text-sm text-muted-foreground">{plan.reason}</p><p className="mt-2 text-xs text-teal">Suggested care: {plan.specialtyIds.map((id) => SPECIALTIES[id].label).join(" → ")}</p></div></div></section> : <section className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-5"><p className="text-sm text-muted-foreground">No assessment yet. Browse nearby care or complete a symptom assessment.</p><Button asChild variant="outline"><Link to="/assessment"><Stethoscope aria-hidden="true" />Assess symptoms</Link></Button></section>}
    <section aria-label="Location"><form onSubmit={searchArea} className="flex flex-col gap-2 sm:flex-row"><label htmlFor="area-search" className="sr-only">Search city, area or pincode</label><Input id="area-search" className="h-10 min-w-0 flex-1" value={area} onChange={(e) => setArea(e.target.value)} placeholder="City, area or pincode" maxLength={200} /><div className="flex gap-2"><Button type="submit" disabled={searchingArea}><Search aria-hidden="true" />{searchingArea ? "Searching…" : "Search area"}</Button><Button type="button" variant="outline" onClick={locate} disabled={locating}><Crosshair aria-hidden="true" />{locating ? "Locating…" : "Use GPS"}</Button></div></form>{areas.length > 0 && <ul className="mt-2 border border-border bg-popover p-1">{areas.map((item) => <li key={`${item.lat},${item.lng}`}><Button variant="ghost" className="h-auto w-full justify-start whitespace-normal py-3 text-left" onClick={() => pickArea(item)}>{item.label}</Button></li>)}</ul>}<p role="status" className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5 shrink-0" aria-hidden="true" />{locating ? `Pinpointing your location…${accuracy != null ? ` ~${accuracy} m so far` : ""}` : coords ? `${locationLabel}${locationSource === "gps" && accuracy != null ? ` · accurate to ~${accuracy} m` : ""}` : "Choose a location to find real providers."}</p>{locationError && <p role="status" className="mt-2 text-sm text-muted-foreground">{locationError}</p>}</section>
    <section aria-label="Care filters" className="space-y-4 border-y border-border py-4"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <FilterSelect label="Specialty" value={specialty} onChange={setSpecialty} options={selectOptions.map((id) => [id, SPECIALTIES[id].label])} />
      <FilterSelect label="Provider type" value={provider} onChange={setProvider} options={[["all", "Doctors & hospitals"], ["clinic", "Doctors & clinics"], ["hospital", "Hospitals"], ["pharmacy", "Pharmacies"]]} />
      <FilterSelect label="Search radius" value={radius} onChange={setRadius} options={[["5", "Within 5 km"], ["10", "Within 10 km"], ["15", "Within 15 km"], ["25", "Within 25 km"]]} />
      <FilterSelect label="Minimum rating" value={rating} onChange={setRating} options={[["0", "All ratings"], ["3", "3+ stars"], ["4", "4+ stars"], ["4.5", "4.5+ stars"]]} />
    </div><div className="flex flex-wrap items-center gap-x-6 gap-y-3"><label className="flex items-center gap-2 text-sm"><Switch checked={openNow} onCheckedChange={setOpenNow} aria-label="Open now" />Open Now</label><label className="flex items-center gap-2 text-sm"><Switch checked={emergencyOnly} onCheckedChange={setEmergencyOnly} aria-label="Emergency care listed" />Emergency care listed</label><Button variant="ghost" size="sm" onClick={() => { setRating("0"); setOpenNow(false); setEmergencyOnly(false); }}><RotateCcw aria-hidden="true" />Clear filters</Button></div></section>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]"><section aria-label="Recommended providers"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="section-title text-lg">{provider === "pharmacy" ? "Nearby pharmacies" : SPECIALTIES[specialty].label}</h2><span className="text-xs text-muted-foreground">{filtered.length} results</span></div>{loading ? <div className="flex items-center gap-3 border-y border-border py-10" role="status"><HeartPulse className="kinetic-heartbeat size-6 text-teal" aria-hidden="true" /><p className="text-sm text-muted-foreground">Finding matching healthcare providers…</p></div> : error ? <div role="status" className="border-y border-border py-6"><p className="break-words text-sm text-muted-foreground">{error}</p><Button className="mt-3" variant="outline" onClick={() => setRefresh((n) => n + 1)}><RotateCcw aria-hidden="true" />Try again</Button></div> : !coords ? <p className="py-10 text-sm text-muted-foreground">Provider results appear after you choose your location.</p> : filtered.length === 0 ? <div className="border-y border-border py-8"><p className="text-sm font-semibold">No matching providers found</p><p className="mt-2 text-sm text-muted-foreground">Try a wider radius, another suggested specialty, or fewer filters. Missing hours and emergency details cannot be treated as confirmed availability.</p></div> : <div className="space-y-3">{filtered.map((place) => <ProviderCard key={place.id} place={place} selected={selected === place.id} onSelect={() => setSelected(place.id)} />)}</div>}<p className="mt-4 text-xs text-muted-foreground">Provider listings: Google Maps. Distances are straight-line estimates, not travel distances. Specialties, departments, emergency services and consultation availability should be confirmed with the provider.</p></section>
      <section aria-label="Healthcare map" className="xl:sticky xl:top-6"><div className="mb-4 flex items-center justify-between gap-2"><h2 className="section-title text-lg">Care around you</h2>{selectedPlace && <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Your location</Button>}</div><div className="overflow-hidden rounded-lg border border-border bg-muted">{mapUrl ? <iframe title={selectedPlace ? `Map of ${selectedPlace.name}` : "Nearby healthcare location map"} src={mapUrl} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" className="h-[360px] w-full border-0 sm:h-[480px]" allowFullScreen /> : <div className="flex h-[360px] items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground"><MapPin className="size-5 shrink-0" aria-hidden="true" />{coords ? "Map is not configured. Provider direction links are still available." : "Waiting for your location"}</div>}</div>{selectedPlace && <p className="mt-3 break-words text-sm font-semibold">{selectedPlace.name}</p>}</section></div>
    <p className="border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
  </div>;
}
function FilterSelect({ label, value, onChange, options }) {
  return <div className="min-w-0"><p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p><Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label}><SelectValue /></SelectTrigger><SelectContent>{options.map(([id, text]) => <SelectItem key={id} value={id}>{text}</SelectItem>)}</SelectContent></Select></div>;
}
