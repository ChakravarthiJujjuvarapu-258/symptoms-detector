import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

/** Category -> Google Places (New) included types. */
const CATEGORY_TYPES = {
  hospital: ["hospital"],
  clinic: ["doctor", "medical_lab"],
  pharmacy: ["pharmacy", "drugstore"],
  emergency: ["hospital", "fire_station", "police"]
};

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.currentOpeningHours.openNow",
  "places.googleMapsUri",
  "places.primaryTypeDisplayName"
].join(",");

function validate(input) {
  const lat = Number(input?.lat);
  const lng = Number(input?.lng);
  const category = String(input?.category ?? "hospital");
  const radius = Math.min(Math.max(Number(input?.radius ?? 5000), 500), 25000);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error("Invalid latitude");
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) throw new Error("Invalid longitude");
  if (!CATEGORY_TYPES[category]) throw new Error("Invalid category");
  return { lat, lng, category, radius };
}

export const findNearbyHealthcare = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validate)
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!lovableKey || !mapsKey) {
      return {
        places: [],
        unavailable: true,
        message:
          "Nearby search is not configured yet. Connect the Google Maps Platform connector to enable it."
      };
    }

    const response = await fetch(`${GATEWAY_URL}/places/v1/places:searchNearby`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": mapsKey,
        "Content-Type": "application/json",
        "X-Goog-FieldMask": FIELD_MASK
      },
      body: JSON.stringify({
        includedTypes: CATEGORY_TYPES[data.category],
        maxResultCount: 20,
        rankPreference: "DISTANCE",
        locationRestriction: {
          circle: {
            center: { latitude: data.lat, longitude: data.lng },
            radius: data.radius
          }
        }
      })
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[places] gateway failed [${response.status}]: ${body}`);
      if (response.status === 403) {
        let reason;
        try {
          reason = JSON.parse(body)?.error?.details?.find((d) => d.reason)?.reason;
        } catch {
          reason = undefined;
        }
        if (reason === "API_KEY_HTTP_REFERRER_BLOCKED") {
          throw new Error(
            'Google Maps server key is referrer-restricted. In Google Cloud Console, set the server key\'s application restrictions to "None" or "IP addresses".'
          );
        }
        if (reason === "API_KEY_SERVICE_BLOCKED") {
          throw new Error(
            "Google Maps server key does not allow the Places API. Add it to the key's allowed-APIs list in Google Cloud Console."
          );
        }
        throw new Error("Google Maps request was denied (403). Check the server key restrictions.");
      }
      throw new Error(`Nearby search failed [${response.status}]: ${body}`);
    }

    const json = await response.json();
    const places = (json.places ?? []).map((p) => {
      const lat = p.location?.latitude;
      const lng = p.location?.longitude;
      return {
        id: p.id,
        name: p.displayName?.text ?? "Unnamed place",
        type: p.primaryTypeDisplayName?.text ?? "",
        address: p.formattedAddress ?? "",
        lat,
        lng,
        rating: p.rating ?? null,
        ratingCount: p.userRatingCount ?? null,
        phone: p.nationalPhoneNumber ?? p.internationalPhoneNumber ?? null,
        website: p.websiteUri ?? null,
        openNow: p.currentOpeningHours?.openNow ?? null,
        mapsUri:
          p.googleMapsUri ??
          (lat && lng ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : null),
        distanceKm:
          Number.isFinite(lat) && Number.isFinite(lng)
            ? haversineKm(data.lat, data.lng, lat, lng)
            : null
      };
    });

    return { places, unavailable: false, message: "" };
  });

/** Geocode a user-typed place/address/pincode so the map can be corrected manually. */
export const geocodeLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => {
    const query = String(input?.query ?? "").trim();
    if (query.length < 3 || query.length > 200) throw new Error("Enter a place, area or pincode.");
    return { query };
  })
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!lovableKey || !mapsKey) {
      return { results: [], unavailable: true, message: "Location search is not configured." };
    }

    const response = await fetch(
      `${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(data.query)}`,
      { headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": mapsKey } }
    );

    if (!response.ok) {
      const body = await response.text();
      console.error(`[geocode] gateway failed [${response.status}]: ${body}`);
      throw new Error(`Location search failed [${response.status}]`);
    }

    const json = await response.json();
    if (json.status !== "OK") {
      return { results: [], unavailable: false, message: "No matching place found. Try a more specific area or pincode." };
    }

    const results = json.results.slice(0, 5).map((r) => ({
      label: r.formatted_address,
      lat: r.geometry?.location?.lat,
      lng: r.geometry?.location?.lng
    })).filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));

    return { results, unavailable: false, message: "" };
  });

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}
