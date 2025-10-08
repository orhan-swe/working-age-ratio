import { getCachedData } from "./getCacheData";
import { SLUG_TO_ENTITY, entityToSlug } from "./utils";

// app/lib/owid.ts
export const revalidate = 86400; // 24h

// Re-export for convenience
export { entityToSlug } from "./utils";

const OWID_CSV =
  "https://ourworldindata.org/grapher/population-young-working-elderly-with-projections.csv";

export type RatioPoint = {
  year: number;
  ratio: number;                // working-age / elderly
  type: "estimate" | "projection";
};

export type CountrySeries = {
  entity: string;               // e.g., "South Korea"
  series: RatioPoint[];
  latestEstimate?: RatioPoint;  // most recent estimate point (if available)
};

// Cache for dynamic slug mappings built from actual data
let DYNAMIC_SLUG_MAP: Record<string, string> | null = null;

/**
 * Build a reverse mapping from all entities in the data
 */
async function buildSlugMapping(): Promise<Record<string, string>> {
  if (DYNAMIC_SLUG_MAP) return DYNAMIC_SLUG_MAP;
  
  const allData = await getCachedData(OWID_CSV);
  console.log(`Building slug mapping from ${allData.length} data rows`);
  const entities = [...new Set(allData.map(r => r.entity))];
  
  DYNAMIC_SLUG_MAP = {};
  for (const entity of entities) {
    const slug = entityToSlug(entity);
    DYNAMIC_SLUG_MAP[slug] = entity;
  }
  
  return DYNAMIC_SLUG_MAP;
}

// If you prefer ISO3 (e.g., /country/kor), add a small iso map or reuse this with different keys.
export async function slugToEntity(slug: string): Promise<string> {
  const s = slug.toLowerCase();
  
  // Check static mappings first
  if (SLUG_TO_ENTITY[s]) {
    return SLUG_TO_ENTITY[s];
  }
  
  // Build and check dynamic mappings
  const mapping = await buildSlugMapping();
  return mapping[s] || slug;
}

/**
 * Fetches OWID CSV, filters for the requested entity, and computes support ratio.
 */
export async function getCountrySeries(entity: string): Promise<CountrySeries | null> {
//   const res = await fetch(OWID_CSV, { next: { revalidate }, cache: "force-cache" });
//   if (!res.ok) throw new Error("Failed to fetch source CSV");


//   const rows = parseCSV(await res.text()).filter((r) => r.entity === entity);

  const rows = (await getCachedData(OWID_CSV)).filter((r) => r.entity === entity);

  if (!rows.length) return null;

  const series: RatioPoint[] = rows
    .map((r) => {
      const estOk = Number.isFinite(r.wEst) && Number.isFinite(r.eEst) && r.wEst > 0 && r.eEst > 0;
      const medOk = Number.isFinite(r.wMed) && Number.isFinite(r.eMed) && r.wMed > 0 && r.eMed > 0;

      const ratioEst = estOk ? r.wEst / r.eEst : undefined;
      const ratioMed = medOk ? r.wMed / r.eMed : undefined;

      if (ratioEst !== undefined) {
        return { year: r.year, ratio: ratioEst, type: "estimate" as const };
      }
      if (ratioMed !== undefined) {
        return { year: r.year, ratio: ratioMed, type: "projection" as const };
      }
      return null;
    })
    .filter((d): d is RatioPoint => !!d);

  const latestEstimate = [...series]
    .reverse()
    .find((p) => p.type === "estimate");

  return { entity, series, latestEstimate };
}

/**
 * Get all available countries/regions from the cached data
 */
export async function getAllCountries(): Promise<CountrySeries[]> {
  const allData = await getCachedData(OWID_CSV);
  
  // Get unique entities
  const entities = [...new Set(allData.map(r => r.entity))];
  
  // Process each entity
  const countries = await Promise.all(
    entities.map(async (entity) => {
      const countrySeries = await getCountrySeries(entity);
      return countrySeries;
    })
  );
  
  // Filter out nulls and sort by latest ratio (most critical first)
  return countries
    .filter((c): c is CountrySeries => c !== null)
    .sort((a, b) => {
      const aRatio = a.latestEstimate?.ratio ?? 0;
      const bRatio = b.latestEstimate?.ratio ?? 0;
      return aRatio - bRatio; // ascending - countries with lowest ratio (most critical) first
    });
}
