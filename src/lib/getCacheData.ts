import { cache } from 'react';
import fs from 'fs/promises';
import path from 'path';

const fetchAndCacheData = cache(async (URL: string): Promise<DataPoint[]> => {
    const cacheFile = path.join(process.cwd(), '.cache', 'owid-data.json');
    try {
        const cached = await fs.readFile(cacheFile, 'utf-8');
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 86400000) { // 24h
            console.log('Using cached data');
            return data;
        }
    } catch {}
    
    // Fetch fresh data
    const res = await fetch(URL, { cache: 'no-store' });
    const data = parseCSV(await res.text());
    
    await fs.mkdir(path.dirname(cacheFile), { recursive: true });
    await fs.writeFile(cacheFile, JSON.stringify({ data, timestamp: Date.now() }));

    console.log('Fetched fresh data');
    return data;
});

export async function getCachedData(URL: string): Promise<DataPoint[]> {
    return await fetchAndCacheData(URL);
}

type DataPoint = {
  entity: string;
  year: number;
  wEst: number; // Working-age population estimate
  eEst: number; // Elderly population estimate
  wMed: number; // Working-age population medium variant
  eMed: number; // Elderly population medium variant
};

export type DataByCountry = {
  [country: string]: DataPoint[];
};

export async function getDataByCountry(URL: string): Promise<DataByCountry> {
  const data = await getCachedData(URL);
  const byCountry: DataByCountry = {};
  for (const row of data) {
    if (!byCountry[row.entity]) {
      byCountry[row.entity] = [];
    }
    byCountry[row.entity].push(row);
  }
  return byCountry;
}
/**
 * A tiny CSV parser that keeps things simple. OWID Grapher CSVs are tidy and
 * don't include commas inside numeric cells for this dataset.
 */
function parseCSV(text: string): DataPoint[] {
  const lines = text.trim().split("\n");
  const header = lines[0].split(",");
  const col = (name: string) => header.indexOf(name);

  const iEntity = col("Entity");
  const iYear = col("Year");
  const iWEst = col("Population - Sex: all - Age: 15-64 - Variant: estimates");
  const iEEst = col("Population - Sex: all - Age: 65+ - Variant: estimates");
  const iWMed = col("Population - Sex: all - Age: 15-64 - Variant: medium");
  const iEMed = col("Population - Sex: all - Age: 65+ - Variant: medium");

  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const num = (v: string) => (v ? Number(v) : NaN);
    return {
      entity: cells[iEntity],
      year: Number(cells[iYear]),
      wEst: num(cells[iWEst]),
      eEst: num(cells[iEEst]),
      wMed: num(cells[iWMed]),
      eMed: num(cells[iEMed]),
    };
  });
}
