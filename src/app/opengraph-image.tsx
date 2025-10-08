import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Global Working-Age to Elderly Ratio (1950-2100)';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '20px',
              lineHeight: 1.2,
            }}
          >
            Global Working-Age to Elderly Ratio
          </h1>
          <p
            style={{
              fontSize: '32px',
              color: '#94a3b8',
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            1950–2100 • 100+ Countries
          </p>
          <div
            style={{
              display: 'flex',
              gap: '30px',
              marginTop: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', backgroundColor: '#ef4444', borderRadius: '4px' }} />
              <span style={{ color: '#cbd5e1', fontSize: '24px' }}>Critical (&lt;2)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', backgroundColor: '#f97316', borderRadius: '4px' }} />
              <span style={{ color: '#cbd5e1', fontSize: '24px' }}>High (2-4)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', backgroundColor: '#eab308', borderRadius: '4px' }} />
              <span style={{ color: '#cbd5e1', fontSize: '24px' }}>Moderate (4-6)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', backgroundColor: '#22c55e', borderRadius: '4px' }} />
              <span style={{ color: '#cbd5e1', fontSize: '24px' }}>Healthy (&gt;6)</span>
            </div>
          </div>
          <p
            style={{
              fontSize: '20px',
              color: '#64748b',
              textAlign: 'center',
              marginTop: '40px',
            }}
          >
            UN DESA Population Prospects via Our World in Data
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
