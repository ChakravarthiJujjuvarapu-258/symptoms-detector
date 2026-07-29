/**
 * MedlinePlus Health Topics web service (U.S. National Library of Medicine).
 * Public, no API key required. Used to validate AI-suggested conditions
 * against a curated medical knowledge base and attach citations.
 * https://medlineplus.gov/about/developers/webservices/
 */
const ENDPOINT = "https://wsearch.nlm.nih.gov/ws/query";
const TIMEOUT_MS = 6000;

function decodeEntities(value) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMarkup(value) {
  // Highlight spans and HTML come back escaped; decode then strip twice.
  return decodeEntities(decodeEntities(value));
}

function parseDocuments(xml, limit) {
  const docs = [];
  const docRe = /<document[^>]*url="([^"]+)"[^>]*>([\s\S]*?)<\/document>/g;
  let match;
  while ((match = docRe.exec(xml)) && docs.length < limit) {
    const [, url, body] = match;
    const field = (name) => {
      const re = new RegExp(`<content name="${name}">([\\s\\S]*?)</content>`);
      const found = body.match(re);
      return found ? stripMarkup(found[1]) : "";
    };
    const title = field("title");
    if (!title) continue;
    const snippet = field("FullSummary") || field("snippet");
    docs.push({
      title,
      url,
      snippet: snippet.length > 320 ? `${snippet.slice(0, 317)}…` : snippet,
      source: "MedlinePlus (U.S. National Library of Medicine)",
    });
  }
  return docs;
}

async function query(term, limit) {
  const url = `${ENDPOINT}?db=healthTopics&rettype=brief&retmax=${limit}&term=${encodeURIComponent(term)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/xml" },
    });
    if (!res.ok) {
      console.error(`MedlinePlus request failed [${res.status}]: ${await res.text()}`);
      return [];
    }
    return parseDocuments(await res.text(), limit);
  } catch (error) {
    console.error("MedlinePlus request error", error);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/** Look up references for one condition name. */
export async function lookupCondition(name, limit = 2) {
  const term = String(name || "").trim();
  if (!term) return [];
  return query(term, limit);
}

/** Look up general references for the free-text symptom description. */
export async function lookupSymptoms(text, limit = 3) {
  const term = String(text || "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 6)
    .join(" ");
  if (!term) return [];
  return query(term, limit);
}

/**
 * Enrich AI-produced conditions with MedlinePlus citations.
 * A condition with no curated match is flagged as unverified rather than dropped.
 */
export async function enrichConditions(conditions) {
  const enriched = await Promise.all(
    conditions.map(async (condition) => {
      const citations = await lookupCondition(condition.name);
      return { ...condition, citations, verified: citations.length > 0 };
    })
  );
  return enriched;
}

/** Deduplicate citations across conditions into a flat source list. */
export function collectSources(conditions, extra = []) {
  const seen = new Map();
  for (const item of [...conditions.flatMap((c) => c.citations ?? []), ...extra]) {
    if (item?.url && !seen.has(item.url)) seen.set(item.url, item);
  }
  return [...seen.values()].slice(0, 8);
}
