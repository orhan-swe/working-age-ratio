import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Country demographic support ratio';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Fetch data directly without cache for edge runtime
async function getCountryData(slug: string) {
  const URL = 'https://ourworldindata.org/grapher/population-young-working-elderly-with-projections.csv';
  const res = await fetch(URL, { next: { revalidate: 86400 } });
  const text = await res.text();
  
  // Simple slug to entity mapping
  const slugMap: Record<string, string> = {
    "south-korea": "South Korea",
    "united-states": "United States",
    "united-kingdom": "United Kingdom",
  };
  
  const entity = slugMap[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  // Parse CSV and find country data
  const lines = text.split('\n').slice(1); // skip header
  const points: { year: number; ratio: number }[] = [];
  
  for (const line of lines) {
    const [lineEntity, , year, , , wMed, eMed] = line.split(',');
    if (lineEntity === entity && wMed && eMed) {
      const w = Number.parseFloat(wMed);
      const e = Number.parseFloat(eMed);
      if (w > 0 && e > 0) {
        points.push({ year: Number.parseInt(year), ratio: w / e });
      }
    }
  }
  
  if (points.length === 0) return null;
  
  // Get latest estimate (before 2022)
  const estimates = points.filter(p => p.year <= 2021);
  const latest = estimates[estimates.length - 1];
  
  return { entity, latestRatio: latest?.ratio ?? 0, latestYear: latest?.year ?? 2023 };
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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

  const { entity, latestRatio, latestYear } = data;
  
  // Get color based on ratio
  const getColor = (ratio: number) => {
    if (ratio < 2) return '#ef4444'; // red
    if (ratio < 4) return '#f97316'; // orange
    if (ratio < 6) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  const color = getColor(latestRatio);

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
          <p
            style={{
              fontSize: '20px',
              color: '#64748b',
              textAlign: 'center',
              marginTop: '30px',
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
