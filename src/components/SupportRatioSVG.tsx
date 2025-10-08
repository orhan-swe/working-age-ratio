"use client";

import React from "react";
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

type Props = {
  width?: number;
  height?: number;
  data: RatioPoint[];
  title?: string;
};

export default function SupportRatioSVG({
  width = 880,
  height = 360,
  data,
  title = "Working-age to Elderly Ratio",
}: Props) {
  // Find the transition point between estimates and projections
  const firstProjectionYear = data.find((d) => d.type === "projection")?.year;

  // Transform data for Recharts (separate estimate and projection values)
  const chartData = data.map((point) => ({
    year: point.year,
    estimate: point.type === "estimate" ? point.ratio : null,
    projection: point.type === "projection" ? point.ratio : null,
  }));

  // Add connecting point at the transition (for smooth line connection)
  if (firstProjectionYear) {
    const lastEstimate = data.find(
      (d, i) => d.type === "estimate" && data[i + 1]?.type === "projection"
    );
    if (lastEstimate) {
      const transitionIndex = chartData.findIndex((d) => d.year === firstProjectionYear);
      if (transitionIndex > 0) {
        chartData[transitionIndex].estimate = lastEstimate.ratio;
      }
    }
  }

  const formatNumber = (n: number) => {
    return n < 10 ? n.toFixed(1) : Math.round(n).toString();
  };

  // Custom tooltip for better visibility in dark mode
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded shadow-lg">
          <p className="text-gray-900 dark:text-gray-100 font-semibold">Year: {label}</p>
          {payload.map((entry: any, index: number) => (
            entry.value !== null && (
              <p key={index} className="text-gray-700 dark:text-gray-300">
                {entry.name}: {formatNumber(entry.value)}
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <h3 className="text-base font-semibold mb-3">{title}</h3>
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

          {/* Estimate line (solid) */}
          <Line
            type="monotone"
            dataKey="estimate"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={false}
            name="Estimates"
            connectNulls={false}
          />

          {/* Projection line (dashed) */}
          <Line
            type="monotone"
            dataKey="projection"
            stroke="#2563eb"
            strokeWidth={2.5}
            strokeDasharray="6 6"
            dot={false}
            name="Projections"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
