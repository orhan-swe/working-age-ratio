"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { REGIONS, type Region } from "@/lib/regions";

type Props = {
  onFilterChange: (search: string, region: Region) => void;
  totalCount: number;
  filteredCount: number;
};

export default function SearchAndFilter({ onFilterChange, totalCount, filteredCount }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedRegion, setSelectedRegion] = useState<Region>(
    (searchParams.get("region") as Region) || "All"
  );

  // Update URL params when filters change
  const updateURL = useCallback((search: string, region: Region) => {
    const params = new URLSearchParams(searchParams);
    
    // Remove old params
    params.delete("search");
    params.delete("region");
    
    // Add new params
    if (search) params.set("search", search);
    if (region !== "All") params.set("region", region);
    
    const newURL = params.toString() ? `?${params.toString()}` : "/";
    router.replace(newURL, { scroll: false });
  }, [router, searchParams]);

  // Notify parent component of filter changes (only when values change)
  useEffect(() => {
    onFilterChange(searchQuery, selectedRegion);
  }, [searchQuery, selectedRegion, onFilterChange]);

  // Update URL separately (only when values change)
  useEffect(() => {
    updateURL(searchQuery, selectedRegion);
  }, [searchQuery, selectedRegion, updateURL]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRegionChange = (region: Region) => {
    setSelectedRegion(region);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRegion("All");
  };

  const hasActiveFilters = searchQuery || selectedRegion !== "All";

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3 items-center flex-col sm:flex-row sm:items-center">
        <div className="w-full sm:flex-1 sm:max-w-md relative">
          <input
            type="search"
            placeholder="Search countries..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Clear filters
          </button>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing <strong className="text-gray-900 dark:text-gray-100">{filteredCount}</strong> of {totalCount} countries
        </div>
      </div>

      {/* Region Tabs */}
      <div className="flex gap-2 flex-wrap">
        {REGIONS.map((region) => (
          <button
            key={region}
            onClick={() => handleRegionChange(region)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedRegion === region
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {region}
          </button>
        ))}
      </div>
    </div>
  );
}
