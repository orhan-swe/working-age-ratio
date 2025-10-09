"use client";

import { useState } from "react";
import SupportRatioSVG from "./SupportRatioSVG";
import CountrySelector from "./CountrySelector";
import type { RatioPoint } from "@/lib/owid";
import { entityToSlug } from "@/lib/utils";

type Country = {
  entity: string;
  slug: string;
};

type Props = {
  entity: string;
  data: RatioPoint[];
  allCountries: Country[];
};

export default function CountryComparisonChart({ entity, data, allCountries }: Props) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<{ entity: string; data: RatioPoint[] }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSelectCountry = async (selectedEntity: string) => {
    if (selectedCountries.includes(selectedEntity)) return;
    
    setLoading(true);
    try {
      // Fetch the country data from API
      const response = await fetch(`/api/country/${entityToSlug(selectedEntity)}`);
      if (!response.ok) throw new Error("Failed to fetch country data");
      
      const countryData = await response.json();
      
      setSelectedCountries([...selectedCountries, selectedEntity]);
      setComparisonData([...comparisonData, { entity: selectedEntity, data: countryData.series }]);
    } catch (error) {
      console.error("Error fetching country data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCountry = (entityToRemove: string) => {
    setSelectedCountries(selectedCountries.filter((e) => e !== entityToRemove));
    setComparisonData(comparisonData.filter((c) => c.entity !== entityToRemove));
  };

  return (
    <>
      <CountrySelector
        countries={allCountries}
        selectedCountries={selectedCountries}
        onSelect={handleSelectCountry}
        onRemove={handleRemoveCountry}
        currentCountry={entity}
      />
      
      {loading && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Loading comparison data...
        </div>
      )}

      <SupportRatioSVG
        data={data}
        entity={entity}
        title={`Working-age : Elderly in ${entity}`}
        comparisonCountries={comparisonData}
      />
    </>
  );
}
