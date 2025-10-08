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
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-3xl font-bold">
            Global Working-Age to Elderly Ratio (1950–2100)
          </h1>
          <a
            href="https://github.com/orhan-swe/working-age-ratio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100/60 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            aria-label="View source on GitHub (opens in new tab)"
          >
            <svg
              className="w-5 h-5 text-gray-800 dark:text-gray-200"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              View source
            </span>
          </a>
        </div>
        <p className="text-base opacity-80 max-w-3xl">
          Compare demographic support ratios across {countries.length} countries and regions. 
          The ratio shows working-age population (15–64) per elderly person (65+). 
          Lower ratios indicate greater demographic pressure. Click any chart to see details.
          Sorted by current ratio (2023 estimate), ascending.
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
