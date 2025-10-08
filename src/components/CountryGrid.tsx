"use client";

import { useState, useMemo, useCallback, Suspense } from "react";
import CompactRatioChart from "./CompactRatioChart";
import SearchAndFilter from "./SearchAndFilter";
import { getRegion, type Region } from "@/lib/regions";
import type { CountrySeries } from "@/lib/owid";
import { entityToSlug } from "@/lib/utils";

type Props = {
  countries: CountrySeries[];
};

export default function CountryGrid({ countries }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<Region>("All");

  // Filter countries based on search and region
  const filteredCountries = useMemo(() => {
    return countries.filter((country) => {
      // Search filter
      const matchesSearch = country.entity
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Region filter
      const countryRegion = getRegion(country.entity);
      const matchesRegion =
        selectedRegion === "All" || countryRegion === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [countries, searchQuery, selectedRegion]);

  const handleFilterChange = useCallback((search: string, region: Region) => {
    setSearchQuery(search);
    setSelectedRegion(region);
  }, []);

  return (
    <>
      <Suspense fallback={
        <div className="mb-6 space-y-4">
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse max-w-md" />
          <div className="flex gap-2">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="h-10 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      }>
        <SearchAndFilter
          onFilterChange={handleFilterChange}
          totalCount={countries.length}
          filteredCount={filteredCountries.length}
        />
      </Suspense>

      {filteredCountries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 dark:text-gray-400">
            No countries found matching your filters
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Try adjusting your search or region selection
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCountries.map((country, index) => (
            <CompactRatioChart
              key={country.entity}
              entity={country.entity}
              slug={entityToSlug(country.entity)}
              data={country.series}
              latestEstimate={country.latestEstimate}
              index={index}
            />
          ))}
        </div>
      )}
    </>
  );
}
