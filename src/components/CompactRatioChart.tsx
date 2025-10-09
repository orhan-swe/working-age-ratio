"use client";

import React, { useState, useEffect } from "react";
import type { RatioPoint } from "@/lib/owid";
import { LineChart, Line, ResponsiveContainer, ReferenceArea, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import Link from "next/link";

type Props = {
  entity: string;
  slug: string;
  data: RatioPoint[];
  latestEstimate?: RatioPoint;
  index?: number; // Add index for staggered animation
};

export default function CompactRatioChart({ entity, slug, data, latestEstimate, index = 0 }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [useLogScale, setUseLogScale] = useState(true);
  const [popupSide, setPopupSide] = useState<'left' | 'right' | null>('left');

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    // If hovered tile is on left half, show popup on right; if on right half, show popup on left
    if (centerX < window.innerWidth / 2) {
      setPopupSide('right');
    } else {
      setPopupSide('left');
    }
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };
    useEffect(() => {
      setIsMounted(true);
      // Staggered appearance: each chart appears with a delay based on its index
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, index * 50); // 25ms delay per chart (100 charts = 2.5 seconds total)

      return () => clearTimeout(timer);
    }, [index]);

    const firstProjectionYear = data.find((d) => d.type === "projection")?.year;

    const chartData = data.map((point) => ({
      year: point.year,
      estimate: point.type === "estimate" ? point.ratio : null,
      projection: point.type === "projection" ? point.ratio : null,
    }));

    // Add connecting point at transition
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

    // Determine severity color based on ratio
    const ratio = latestEstimate?.ratio ?? 0;
    let severityColor = "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
    let textColor = "text-green-900 dark:text-green-100";
  
    if (ratio < 2) {
      severityColor = "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
      textColor = "text-red-900 dark:text-red-100";
    } else if (ratio < 4) {
      severityColor = "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800";
      textColor = "text-orange-900 dark:text-orange-100";
    } else if (ratio < 6) {
      severityColor = "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
      textColor = "text-yellow-900 dark:text-yellow-100";
    }

    const formatNumber = (n: number) => {
      return n < 10 ? n.toFixed(1) : Math.round(n).toString();
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-2 rounded shadow-lg text-xs">
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
    if (!isVisible)
      return null;

    return (
      <div className="relative">
        <Link 
          href={`/country/${slug}`}
          className="block"
          onMouseEnter={(e) => handleMouseEnter(e)}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={`border rounded-lg p-3 hover:shadow-lg transition-shadow cursor-pointer ${severityColor}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className={`font-semibold text-sm ${textColor} truncate flex-1`} title={entity}>
                {entity}
              </h3>
              {latestEstimate && (
                <span className={`text-xs font-bold ml-2 ${textColor}`}>
                  {latestEstimate.ratio.toFixed(1)}
                </span>
              )}
            </div>
          
            <div className="h-24 pointer-events-none">
              {!isMounted ? (
                // Placeholder during SSR to prevent hydration mismatch
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" >Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart  data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    {firstProjectionYear && (
                      <ReferenceArea
                        x1={firstProjectionYear}
                        x2="dataMax"
                        fill="#888"
                        fillOpacity={0.05}
                      />
                    )}
                    <YAxis
                      scale="log" domain={[1, 'auto']} hide={true} 
                      />
                    <Line
                      type="monotone"
                      dataKey="estimate"
                      stroke="#2563eb"
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="projection"
                      stroke="#2563eb"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={false}
                      connectNulls={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          
            {latestEstimate && (
              <p className={`text-xs mt-1 ${textColor} opacity-75`}>
                {latestEstimate.year} estimate
              </p>
            )}
          </div>
        </Link>

        {/* Hover Popup - Larger Chart Preview */}
        {isHovering && isMounted && (
          <div className="fixed z-50 pointer-events-none" style={{
            left: popupSide === 'left' ? '1.5rem' : undefined,
            right: popupSide === 'right' ? '1.5rem' : undefined,
            bottom: '2rem',
            transform: 'none',
          }}>
            <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl p-4 w-[600px]">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {entity}{useLogScale ? ' (Log scale)' : ' (Linear scale)'}
                </h3>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setUseLogScale(!useLogScale);
                  }}
                  className="pointer-events-auto px-3 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {useLogScale ? 'Linear' : 'Log'} scale
                </button>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} />
                    <XAxis 
                      dataKey="year" 
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      stroke="#888"
                      tick={{ fill: '#888', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#888"
                      tick={{ fill: '#888', fontSize: 12 }}
                      tickFormatter={formatNumber}
                      scale={useLogScale ? "log" : "linear"}
                      domain={useLogScale ? [1, 'auto'] : ['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {firstProjectionYear && (
                      <ReferenceArea
                        x1={firstProjectionYear}
                        x2="dataMax"
                        fill="#888"
                        fillOpacity={0.1}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="estimate"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={false}
                      name="Estimates"
                      connectNulls={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="projection"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      strokeDasharray="6 6"
                      dot={false}
                      name="Projections"
                      connectNulls={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {latestEstimate && (
                <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                  Latest estimate: <strong>{latestEstimate.ratio.toFixed(2)}</strong> working-age per elderly ({latestEstimate.year})
                </p>
              )}
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400 italic">
                Click to view full details
              </p>
            </div>
          </div>
        )}
      </div>
    );
  } 
