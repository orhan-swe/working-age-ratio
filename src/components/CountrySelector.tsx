"use client";

import { useState, useRef, useEffect } from "react";
import { entityToSlug } from "@/lib/utils";

type Country = {
  entity: string;
  slug: string;
};

type Props = {
  countries: Country[];
  selectedCountries: string[]; // array of entity names
  onSelect: (entity: string) => void;
  onRemove: (entity: string) => void;
  currentCountry: string; // the main country being viewed
};

export default function CountrySelector({ 
  countries, 
  selectedCountries, 
  onSelect, 
  onRemove,
  currentCountry,
}: Props) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter countries by search and exclude current country and already selected
  const filteredCountries = countries.filter((c) => {
    if (c.entity === currentCountry) return false;
    if (selectedCountries.includes(c.entity)) return false;
    if (!search) return true;
    return c.entity.toLowerCase().includes(search.toLowerCase());
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        Compare with other countries
      </label>
      
      {/* Selected countries pills */}
      {selectedCountries.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedCountries.map((entity) => (
            <div
              key={entity}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
            >
              <span>{entity}</span>
              <button
                onClick={() => onRemove(entity)}
                className="hover:text-blue-600 dark:hover:text-blue-400"
                aria-label={`Remove ${entity}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input and dropdown */}
      <div className="relative" ref={dropdownRef}>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search countries to add..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Dropdown */}
        {isOpen && filteredCountries.length > 0 && (
          <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
            {filteredCountries.slice(0, 50).map((country) => (
              <button
                key={country.entity}
                onClick={() => {
                  onSelect(country.entity);
                  setSearch("");
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              >
                {country.entity}
              </button>
            ))}
          </div>
        )}

        {/* No results */}
        {isOpen && search && filteredCountries.length === 0 && (
          <div className="absolute z-10 mt-1 w-full p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg text-gray-500 dark:text-gray-400 text-sm">
            No countries found
          </div>
        )}
      </div>
    </div>
  );
}
