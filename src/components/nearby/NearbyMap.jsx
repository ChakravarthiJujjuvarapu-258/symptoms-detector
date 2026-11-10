import { useEffect, useMemo, useRef, useState } from "react";

const MAPS_KEY = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
const TRACKING_ID = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"];
let mapsLoadPromise;

function loadGoogleMaps() {
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google);
  if (mapsLoadPromise) return mapsLoadPromise;

  mapsLoadPromise = new Promise((resolve, reject) => {
    const callbackName = "__nearbyCareMapsReady";
    const params = new URLSearchParams({ key: MAPS_KEY, loading: "async", callback: callbackName });
    if (TRACKING_ID) params.set("channel", TRACKING_ID);

    const script = document.createElement("script");
    script.async = true;
    script.dataset.nearbyCareMaps = "true";
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    window[callbackName] = () => {
      delete window[callbackName];
      resolve(window.google);
    };
    script.onerror = () => {
      delete window[callbackName];
      mapsLoadPromise = undefined;
      reject(new Error("Google Maps could not be loaded."));
    };
    document.head.appendChild(script);
  });

  return mapsLoadPromise;
}

function markerContent(place) {
  const content = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = place.name || "Healthcare provider";
  content.appendChild(name);
  if (place.address) {
    const address = document.createElement("p");
    address.textContent = place.address;
    content.appendChild(address);
  }
  return content;
}

export function NearbyMap({ coords, providers, selectedId, onSelect, className = "" }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());
  const [mapError, setMapError] = useState("");
  const mappedProviders = useMemo(
    () => providers.filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng)),
    [providers]
  );

  useEffect(() => {
    if (!coords || !MAPS_KEY || !containerRef.current) return undefined;
    let active = true;
    const markers = [];
    setMapError("");

    const renderMap = async () => {
      const google = await loadGoogleMaps();
      const { Map } = await google.maps.importLibrary("maps");
      if (!active || !containerRef.current) return;

      const map = mapRef.current ?? new Map(containerRef.current, {
        center: { lat: coords.lat, lng: coords.lng },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        clickableIcons: false,
        internalUsageAttributionIds: ["gmp_lovable_agentskills_v1"],
      });
      mapRef.current = map;

      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: coords.lat, lng: coords.lng });
      const currentMarker = new google.maps.Marker({
        map,
        position: { lat: coords.lat, lng: coords.lng },
        title: "Your current location",
        label: "You",
      });
      markers.push(currentMarker);

      const infoWindow = new google.maps.InfoWindow();
      const providerMarkers = new Map();
      mappedProviders.forEach((place, index) => {
        const marker = new google.maps.Marker({
          map,
          position: { lat: place.lat, lng: place.lng },
          title: place.name || "Healthcare provider",
          label: String(index + 1),
        });
        marker.addListener("click", () => {
          onSelect(place.id);
          infoWindow.setContent(markerContent(place));
          infoWindow.open({ map, anchor: marker });
        });
        providerMarkers.set(place.id, marker);
        markers.push(marker);
        bounds.extend({ lat: place.lat, lng: place.lng });
      });

      markersRef.current = providerMarkers;
      if (mappedProviders.length) {
        map.fitBounds(bounds, 48);
      } else {
        map.setCenter({ lat: coords.lat, lng: coords.lng });
        map.setZoom(14);
      }
    };

    renderMap().catch((error) => {
      if (active) setMapError(error.message || "The map could not be loaded.");
    });

    return () => {
      active = false;
      markers.forEach((marker) => marker.setMap(null));
      markersRef.current = new Map();
    };
  }, [coords, mappedProviders, onSelect]);

  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const marker = markersRef.current.get(selectedId);
    if (marker) mapRef.current.panTo(marker.getPosition());
  }, [selectedId]);

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} role="region" aria-label="Map showing your location and nearby healthcare providers" className="h-full w-full" />
      {mapError && <div role="status" className="absolute inset-0 flex items-center justify-center bg-background/90 px-6 text-center text-sm text-muted-foreground">{mapError}</div>}
    </div>
  );
}