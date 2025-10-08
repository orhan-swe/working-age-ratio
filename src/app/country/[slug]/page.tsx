// app/country/[slug]/page.tsx
import { getCountrySeries, slugToEntity } from "@/lib/owid";
import SupportRatioSVG from "@/components/SupportRatioSVG";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 86400; // daily

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entity = await slugToEntity(slug);
  return {
    title: `Working-age to Elderly Ratio – ${entity} (1950–2100)`,
    description: `Historical and projected support ratio for ${entity}: working-age population (15–64) relative to elderly (65+). Source: UN World Population Prospects 2024 via Our World in Data.`,
    alternates: { canonical: `/country/${slug}` },
    openGraph: {
      title: `Support Ratio in ${entity}`,
      description: `Working-age : Elderly for ${entity}, 1950–2100.`,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entity = await slugToEntity(slug);
  const data = await getCountrySeries(entity);
  if (!data) notFound();

  const { series, latestEstimate } = data;

  // Pick a few SEO-friendly table rows (you can tune the years)
  const pickYears = [1960, 1980, 2000, 2020, 2030, 2050, 2100];
  const lookup = new Map(series.map((p) => [p.year, p]));
  const tableRows = pickYears
    .map((y) => ({ year: y, point: lookup.get(y) }))
    .filter((r) => !!r.point) as { year: number; point: { ratio: number; type: string } }[];

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Link 
        href="/" 
        className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
      >
        ← Back to all countries
      </Link>
      
      <h1 className="text-2xl font-semibold">
        Working-age to Elderly Ratio — {data.entity}
      </h1>
      <p className="mt-2 text-sm opacity-80">
        The support ratio is defined as <strong>(15–64) / (65+)</strong>. Estimates run to ~2021,
        and UN medium-variant projections thereafter (to 2100).
      </p>

      <div className="mt-4">
        <SupportRatioSVG
          data={series}
          title={`Working-age : Elderly in ${data.entity}`}
        />
      </div>

      {latestEstimate && (
        <p className="mt-3">
          Latest estimate: <strong>{latestEstimate.ratio.toFixed(2)}</strong> working-age per elderly
          (year {latestEstimate.year}). Projections suggest further changes beyond this year.
        </p>
      )}

      <h2 className="text-xl font-semibold mt-8">Key Years</h2>
      <table className="mt-2 w-full text-sm border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Year</th>
            <th className="py-2 text-left">Support ratio</th>
            <th className="py-2 text-left">Type</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((r) => (
            <tr key={r.year} className="border-b last:border-none">
              <td className="py-2">{r.year}</td>
              <td className="py-2">{r.point.ratio.toFixed(2)}</td>
              <td className="py-2 capitalize">{r.point.type}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="mt-8 prose prose-sm">
        <h3>About this metric</h3>
        <p>
          This ratio is the inverse of the old-age dependency ratio (OADR). If OADR is
          <em>elderly per 100 working-age</em>, then support ratio is
          <em>working-age per elderly</em>. Both come from the same UN demographic series.
        </p>
        <p className="opacity-80">
          Source: UN DESA – World Population Prospects 2024 via Our World in Data (CC BY).
        </p>
      </section>
    </main>
  );
}
