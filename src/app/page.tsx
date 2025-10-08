import { getAllCountries } from "@/lib/owid";
import CountryGrid from "@/components/CountryGrid";
import type { Metadata } from "next";

export const revalidate = 86400; // daily

export const metadata: Metadata = {
  title: "Global Working-Age to Elderly Ratio (1950-2100) | All Countries",
  description: "Compare demographic support ratios across 100+ countries and regions. Interactive visualizations of working-age population (15-64) per elderly person (65+). Historical estimates (1950-2021) and UN projections to 2100.",
  openGraph: {
    title: "Global Demographic Support Ratios - All Countries",
    description: "Compare working-age to elderly ratios across 100+ countries from 1950-2100",
  },
};

export default async function Home() {
  const countries = await getAllCountries();
  console.log(`Rendering home with ${countries.length} countries`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Global Working-Age to Elderly Ratio (1950-2100)",
    "description": "Demographic support ratios across 100+ countries showing working-age population (15-64) per elderly person (65+)",
    "url": process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com",
    "keywords": "demographic data, population aging, support ratio, dependency ratio, elderly population",
    "creator": {
      "@type": "Organization",
      "name": "UN DESA"
    },
    "temporalCoverage": "1950/2100",
    "spatialCoverage": {
      "@type": "Place",
      "name": "Global"
    },
    "distribution": {
      "@type": "DataDownload",
      "encodingFormat": "text/html",
      "contentUrl": process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">
          Global Working-Age to Elderly Ratio (1950–2100)
        </h1>
        <p className="text-base opacity-80 max-w-3xl">
          Compare demographic support ratios across {countries.length} countries and regions. 
          The ratio shows working-age population (15–64) per elderly person (65+). 
          Lower ratios indicate greater demographic pressure. Click any chart to see details.
        </p>
        <p className="text-sm opacity-70 mt-2">
          <span className="inline-block w-3 h-3 bg-red-200 dark:bg-red-900 mr-1"></span> Critical (&lt;2) 
          <span className="inline-block w-3 h-3 bg-orange-200 dark:bg-orange-900 mr-1 ml-3"></span> High pressure (2-4) 
          <span className="inline-block w-3 h-3 bg-yellow-200 dark:bg-yellow-900 mr-1 ml-3"></span> Moderate (4-6) 
          <span className="inline-block w-3 h-3 bg-green-200 dark:bg-green-900 mr-1 ml-3"></span> Healthy (&gt;6)
        </p>
      </div>

      <CountryGrid countries={countries} />

      <footer className="mt-12 pt-6 border-t opacity-70 text-sm">
        <p>
          Source: UN DESA – World Population Prospects 2024 via Our World in Data (CC BY).
          Data includes historical estimates (~1950–2021) and medium-variant projections (2022–2100).
        </p>
      </footer>
    </main>
  );
}
