"use client";

import React, { useState } from "react";
import type { RatioPoint } from "@/lib/owid";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";

type CountryData = {
  entity: string;
  data: RatioPoint[];
};

type Props = {
  width?: number;
  height?: number;
  data: RatioPoint[];
  title?: string;
  entity?: string; // Main country entity name
  comparisonCountries?: CountryData[]; // Additional countries to compare
};

// Color palette for multiple countries
const COLORS = [
  "#2563eb", // blue (main country)
  "#dc2626", // red
  "#16a34a", // green
  "#ea580c", // orange
  "#9333ea", // purple
  "#0891b2", // cyan
  "#ca8a04", // yellow
  "#db2777", // pink
];

export default function SupportRatioSVG({
  width = 880,
  height = 360,
  data,
  title = "Working-age to Elderly Ratio",
  entity = "Main",
  comparisonCountries = [],
}: Props) {
  const [useLogScale, setUseLogScale] = useState(true);
  
  // Combine all countries data for chart
  const allCountries = [
    { entity, data },
    ...comparisonCountries
  ];
  
  // Find the transition point between estimates and projections (from main data)
  const firstProjectionYear = data.find((d) => d.type === "projection")?.year;

  // Build unified chart data with all years from all countries
  const allYears = new Set<number>();
  allCountries.forEach(({ data: countryData }) => {
    countryData.forEach((point) => allYears.add(point.year));
  });
  const sortedYears = Array.from(allYears).sort((a, b) => a - b);

  // Create chart data structure
  const chartData = sortedYears.map((year) => {
    const dataPoint: any = { year };
    
    allCountries.forEach(({ entity, data: countryData }, index) => {
      const point = countryData.find((p) => p.year === year);
      if (point) {
        if (point.type === "estimate") {
          dataPoint[`${entity}_estimate`] = point.ratio;
        } else {
          dataPoint[`${entity}_projection`] = point.ratio;
        }
      }
    });
    
    return dataPoint;
  });

  // Add connecting points at transitions for each country
  allCountries.forEach(({ entity, data: countryData }) => {
    const countryFirstProjection = countryData.find((d) => d.type === "projection")?.year;
    if (countryFirstProjection) {
      const lastEstimate = countryData.find(
        (d, i) => d.type === "estimate" && countryData[i + 1]?.type === "projection"
      );
      if (lastEstimate) {
        const transitionIndex = chartData.findIndex((d) => d.year === countryFirstProjection);
        if (transitionIndex > 0) {
          chartData[transitionIndex][`${entity}_estimate`] = lastEstimate.ratio;
        }
      }
    }
  });

  const formatNumber = (n: number) => {
    return n < 10 ? n.toFixed(1) : Math.round(n).toString();
  };

  // Custom tooltip for better visibility in dark mode
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Group by country
      const grouped: { [key: string]: { estimate?: number; projection?: number } } = {};
      payload.forEach((entry: any) => {
        if (entry.value !== null) {
          const match = entry.dataKey.match(/^(.+)_(estimate|projection)$/);
          if (match) {
            const [, country, type] = match;
            if (!grouped[country]) grouped[country] = {};
            grouped[country][type as "estimate" | "projection"] = entry.value;
          }
        }
      });

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded shadow-lg">
          <p className="text-gray-900 dark:text-gray-100 font-semibold mb-1">Year: {label}</p>
          {Object.entries(grouped).map(([country, values]) => {
            const value = values.estimate ?? values.projection;
            return value !== undefined ? (
              <p key={country} className="text-gray-700 dark:text-gray-300">
                {country}: {formatNumber(value)}
              </p>
            ) : null;
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-semibold">{title + (useLogScale ? ' (Log Scale)' : ' (Linear Scale)')}</h3>
        <button
          onClick={() => setUseLogScale(!useLogScale)}
          className="px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors border border-gray-300 dark:border-gray-600"
        >
          {useLogScale ? '📊 Switch to Linear' : '📈 Switch to Log'} scale
        </button>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} />
          <XAxis
            dataKey="year"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) => value.toString()}
            label={{ value: "Year", position: "insideBottom", offset: -5 }}
            stroke="#888"
          />
          <YAxis
            label={{
              value: "Ratio (15–64 / 65+)",
              angle: -90,
              position: "insideLeft",
            }}
            tickFormatter={formatNumber}
            stroke="#888"
            scale={useLogScale ? "log" : "linear"}
            domain={useLogScale ? [1, 'auto'] : [0, 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="line"
          />

          {/* Shaded area for projections */}
          {firstProjectionYear && (
            <ReferenceArea
              x1={firstProjectionYear}
              x2="dataMax"
              fill="#888"
              fillOpacity={0.1}
            />
          )}

          {/* Lines for each country (estimates and projections) */}
          {allCountries.map(({ entity }, index) => {
            const color = COLORS[index % COLORS.length];
            return (
              <React.Fragment key={entity}>
                {/* Estimate line (solid) */}
                <Line
                  type="monotone"
                  dataKey={`${entity}_estimate`}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={false}
                  name={`${entity} (Est.)`}
                  connectNulls={false}
                />
                {/* Projection line (dashed) */}
                <Line
                  type="monotone"
                  dataKey={`${entity}_projection`}
                  stroke={color}
                  strokeWidth={2.5}
                  strokeDasharray="6 6"
                  dot={false}
                  name={`${entity} (Proj.)`}
                  connectNulls={false}
                />
              </React.Fragment>
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
