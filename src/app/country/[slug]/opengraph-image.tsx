import { ImageResponse } from 'next/og';
import { SLUG_TO_ENTITY, entityToSlug } from '@/lib/utils';

export const runtime = 'edge';
export const alt = 'Country demographic support ratio';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

type DataPoint = {
  entity: string;
  year: number;
  wEst: number;
  eEst: number;
  wMed: number;
  eMed: number;
};

// Parse CSV efficiently in one pass
function parseCSV(text: string): DataPoint[] {
  const lines = text.trim().split('\n');
  const header = lines[0].split(',');
  
  const iEntity = header.indexOf('Entity');
  const iYear = header.indexOf('Year');
  const iWEst = header.indexOf('Population - Sex: all - Age: 15-64 - Variant: estimates');
  const iEEst = header.indexOf('Population - Sex: all - Age: 65+ - Variant: estimates');
  const iWMed = header.indexOf('Population - Sex: all - Age: 15-64 - Variant: medium');
  const iEMed = header.indexOf('Population - Sex: all - Age: 65+ - Variant: medium');
  
  return lines.slice(1).map(line => {
    const cells = line.split(',');
    return {
      entity: cells[iEntity] || '',
      year: Number(cells[iYear]) || 0,
      wEst: Number(cells[iWEst]) || 0,
      eEst: Number(cells[iEEst]) || 0,
      wMed: Number(cells[iWMed]) || 0,
      eMed: Number(cells[iEMed]) || 0,
    };
  });
}

// Fetch and process data for OG image (edge-compatible)
async function getCountryData(slug: string) {
  const URL = 'https://ourworldindata.org/grapher/population-young-working-elderly-with-projections.csv';
  // Use cache: 'no-store' to avoid Next.js 2MB cache limit (CSV is 2.3MB)
  // Vercel edge will still cache the response at CDN level
  const res = await fetch(URL, { cache: 'no-store' });
  const text = await res.text();
  
  // Parse CSV once
  const allData = parseCSV(text);
  
  // Build slug mapping from parsed data
  const entities = new Set<string>();
  for (const row of allData) {
    if (row.entity) entities.add(row.entity);
  }
  
  const slugMap: Record<string, string> = { ...SLUG_TO_ENTITY };
  for (const entity of entities) {
    const entitySlug = entityToSlug(entity);
    if (!slugMap[entitySlug]) {
      slugMap[entitySlug] = entity;
    }
  }
  
  // Get the entity name for this slug
  const entity = slugMap[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  // Filter data for this country and calculate ratios
  const points: { year: number; ratio: number; type: 'estimate' | 'projection' }[] = [];
  
  for (const row of allData) {
    if (row.entity === entity) {
      // Prefer estimates first (historical data)
      if (row.wEst > 0 && row.eEst > 0) {
        points.push({ 
          year: row.year, 
          ratio: row.wEst / row.eEst,
          type: 'estimate'
        });
      } 
      // Fall back to medium variant (projections)
      else if (row.wMed > 0 && row.eMed > 0) {
        points.push({ 
          year: row.year, 
          ratio: row.wMed / row.eMed,
          type: 'projection'
        });
      }
    }
  }
  
  if (points.length === 0) return null;
  
  // Get latest estimate (before 2022)
  const estimates = points.filter(p => p.type === 'estimate');
  const latest = estimates.length > 0 ? estimates[estimates.length - 1] : points[points.length - 1];
  
  return { 
    entity, 
    latestRatio: latest?.ratio ?? 0, 
    latestYear: latest?.year ?? 2021,
    points // Return all points for the chart
  };
}

export default async function Image({ 
  params,
  searchParams,
}: { 
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  // Accept any query params like ?v=1, ?refresh=true, etc. for cache busting
  // We don't use them, but they help force browsers/crawlers to refetch
  
  const data = await getCountryData(slug);

  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
          }}
        >
          <p style={{ color: '#fff', fontSize: '48px' }}>Country not found</p>
        </div>
      ),
      { ...size }
    );
  }

  const { entity, latestRatio, latestYear, points } = data;
  
  // Get color based on ratio
  const getColor = (ratio: number) => {
    if (ratio < 2) return '#ef4444'; // red
    if (ratio < 4) return '#f97316'; // orange
    if (ratio < 6) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  const color = getColor(latestRatio);

  // Generate SVG path for sparkline chart
  const chartWidth = 600;
  const chartHeight = 100;
  const minYear = Math.min(...points.map(p => p.year));
  const maxYear = Math.max(...points.map(p => p.year));
  const minRatio = Math.min(...points.map(p => p.ratio));
  const maxRatio = Math.max(...points.map(p => p.ratio));
  
  const xScale = (year: number) => ((year - minYear) / (maxYear - minYear)) * chartWidth;
  const yScale = (ratio: number) => chartHeight - ((ratio - minRatio) / (maxRatio - minRatio)) * chartHeight;
  
  // Create path for the chart line
  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.year)},${yScale(p.ratio)}`)
    .join(' ');
  
  // Find where projections start (dashed line)
  const firstProjectionIndex = points.findIndex(p => p.type === 'projection');
  const estimatesPath = firstProjectionIndex > 0 
    ? points.slice(0, firstProjectionIndex + 1).map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.year)},${yScale(p.ratio)}`).join(' ')
    : pathData;
  const projectionsPath = firstProjectionIndex > 0
    ? points.slice(firstProjectionIndex).map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.year)},${yScale(p.ratio)}`).join(' ')
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'linear-gradient(to bottom right, #0a0a0a, #1a1a2e)',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '10px',
            }}
          >
            {entity}
          </h1>
          <p
            style={{
              fontSize: '28px',
              color: '#94a3b8',
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            Working-Age to Elderly Ratio
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            <span
              style={{
                fontSize: '120px',
                fontWeight: 'bold',
                color: color,
              }}
            >
              {latestRatio.toFixed(1)}
            </span>
            <span
              style={{
                fontSize: '48px',
                color: '#64748b',
              }}
            >
              ({latestYear})
            </span>
          </div>
          <p
            style={{
              fontSize: '24px',
              color: '#cbd5e1',
              textAlign: 'center',
              marginTop: '20px',
            }}
          >
            {latestRatio.toFixed(1)} working-age people per elderly person
          </p>
          
          {/* Sparkline Chart */}
          <div
            style={{
              display: 'flex',
              marginTop: '40px',
              width: '600px',
            }}
          >
            <svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>
              {/* Estimates line (solid) */}
              <path
                d={estimatesPath}
                stroke="#2563eb"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Projections line (dashed) */}
              {projectionsPath && (
                <path
                  d={projectionsPath}
                  stroke="#2563eb"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>
          
          <p
            style={{
              fontSize: '16px',
              color: '#64748b',
              textAlign: 'center',
              marginTop: '20px',
            }}
          >
            1950–2100 trend
          </p>
          
          <p
            style={{
              fontSize: '20px',
              color: '#64748b',
              textAlign: 'center',
              marginTop: '10px',
            }}
          >
            Historical estimates (1950–2021) & UN projections (2022–2100)
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
