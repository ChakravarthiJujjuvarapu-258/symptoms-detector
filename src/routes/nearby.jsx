import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Crosshair,
  ExternalLink,
  Hospital,
  MapPin,
  Phone,
  Pill,
  Siren,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Disclaimer } from "@/components/Disclaimer";
import { findNearbyHealthcare } from "@/lib/health/places.functions";

const Route = createFileRoute("/nearby")({
  head: () => ({
    meta: [
      { title: "Nearby Healthcare Finder \u2014 AI Symptoms Detector" },
      {
        name: "description",
        content: "Find hospitals, clinics, pharmacies and emergency services near you on a live map, with addresses, phone numbers and directions."
      },
      { property: "og:title", content: "Nearby Healthcare Finder \u2014 AI Symptoms Detector" },
      {
        property: "og:description",
        content: "Locate hospitals, clinics, pharmacies and emergency services near your location."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ]
  }),
  component: NearbyPage
});

const CATEGORIES = [
  { id: "hospital", label: "Hospitals", icon: Hospital },
  { id: "clinic", label: "Clinics", icon: Building2 },
  { id: "pharmacy", label: "Pharmacies", icon: Pill },
  { id: "emergency", label: "Emergency", icon: Siren }
];

const MAPS_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;

function NearbyPage() {
  const [category, setCategory] = useState("hospital");
  const [coords, setCoords] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const locate = useCallback(() => {
    setError("");
    if (!("geolocation" in navigator)) {
      setError("Location is not supported in this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setLoading(false);
        setError("Location permission denied. Allow location access to find nearby care.");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  useEffect(() => {
    if (!coords) return;
    let active = true;
    setLoading(true);
    setError("");
    findNearbyHealthcare({ data: { ...coords, category, radius: 8000 } })
      .then((res) => {
        if (!active) return;
        setPlaces(res.places ?? []);
        setSelected(null);
        if (res.unavailable) setError(res.message);
        else if (!res.places?.length) setError("No results found within 8 km. Try another category.");
      })
      .catch((e) => {
        if (!active) return;
        setPlaces([]);
        setError(e?.message || "Nearby search failed. Please try again.");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [coords, category]);

  const mapCenter = selected ?? coords;
  const embedUrl =
    MAPS_KEY && mapCenter
      ? `https://www.google.com/maps/embed/v1/view?key=${MAPS_KEY}&center=${mapCenter.lat},${mapCenter.lng}&zoom=${selected ? 16 : 13}`
      : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Nearby healthcare finder
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Hospitals, clinics, pharmacies and emergency services around your current location.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <Button
            key={c.id}
            variant={category === c.id ? "default" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => setCategory(c.id)}
            aria-pressed={category === c.id}
          >
            <c.icon className="size-4" aria-hidden="true" />
            {c.label}
          </Button>
        ))}
        <Button variant="secondary" size="sm" className="ml-auto rounded-xl" onClick={locate}>
          <Crosshair className="size-4" aria-hidden="true" />
          Use my location
        </Button>
      </div>

      {error ? (
        <p role="status" className="rounded-2xl border border-border bg-surface/60 p-4 text-sm text-muted-foreground">
          {error}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden rounded-3xl surface-panel">
          {embedUrl ? (
            <iframe
              key={embedUrl}
              title="Map of nearby healthcare services"
              src={embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[320px] w-full border-0 lg:h-[560px]"
              allowFullScreen
            />
          ) : (
            <div className="grid h-[320px] place-items-center text-sm text-muted-foreground lg:h-[560px]">
              <span className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden="true" />
                Waiting for your location…
              </span>
            </div>
          )}
        </Card>

        <div className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Searching nearby…</p>}
          {places.map((p) => (
            <Card
              key={p.id}
              className={`animate-fade-up cursor-pointer rounded-2xl surface-panel transition-colors ${
                selected?.id === p.id ? "border-primary" : ""
              }`}
              onClick={() => setSelected({ id: p.id, lat: p.lat, lng: p.lng })}
            >
              <CardContent className="p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{p.name}</h2>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{p.address}</p>
                  </div>
                  {p.distanceKm != null ? (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      {p.distanceKm} km
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {p.rating ? (
                    <span className="flex items-center gap-1">
                      <Star className="size-3.5 text-teal" aria-hidden="true" />
                      {p.rating} ({p.ratingCount ?? 0})
                    </span>
                  ) : null}
                  {p.openNow != null ? (
                    <span className={p.openNow ? "font-semibold text-teal" : ""}>
                      {p.openNow ? "Open now" : "Closed"}
                    </span>
                  ) : null}
                  {p.type ? <span>{p.type}</span> : null}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {p.phone ? (
                    <Button asChild size="sm" variant="outline" className="rounded-xl">
                      <a href={`tel:${p.phone}`} onClick={(e) => e.stopPropagation()}>
                        <Phone className="size-4" aria-hidden="true" />
                        Call
                      </a>
                    </Button>
                  ) : null}
                  {p.mapsUri ? (
                    <Button asChild size="sm" variant="outline" className="rounded-xl">
                      <a
                        href={p.mapsUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MapPin className="size-4" aria-hidden="true" />
                        Directions
                      </a>
                    </Button>
                  ) : null}
                  {p.website ? (
                    <Button asChild size="sm" variant="ghost" className="rounded-xl">
                      <a
                        href={p.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="size-4" aria-hidden="true" />
                        Website
                      </a>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}

export { Route };
