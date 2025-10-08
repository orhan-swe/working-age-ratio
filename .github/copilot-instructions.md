# Working Age Ratio - Project Instructions

## Overview
This Next.js application visualizes demographic support ratios (working-age population to elderly) across ~100 countries from 1950-2100 using UN World Population Prospects data via Our World in Data.

## Architecture

### Data Flow
1. **Data Source**: OWID CSV (~2.3MB) containing population estimates and projections
2. **Caching**: File-based cache in `.cache/owid-data.json` (24h TTL) to avoid Next.js 2MB cache limit
3. **Processing**: Raw CSV → parsed DataPoints → computed RatioPoints (working-age/elderly)

### Key Files
- **`src/lib/owid.ts`**: Core data functions
  - `getCountrySeries(entity)`: Get single country data
  - `getAllCountries()`: Get all countries (sorted by ratio, ascending)
  - `slugToEntity()`, `entityToSlug()`: Convert between entity names and URL slugs
  
- **`src/lib/getCacheData.ts`**: File-based caching layer using React's `cache()` API
  - `getCachedData(URL)`: Fetches/caches CSV data
  - Stores to `.cache/owid-data.json` with timestamp
  
- **`src/app/page.tsx`**: Home page with all countries in grid
  - Uses `CompactRatioChart` components
  - Color-coded by severity (red=critical, orange=high, yellow=moderate, green=healthy)
  
- **`src/app/country/[slug]/page.tsx`**: Detailed country page
  - Uses `SupportRatioSVG` component
  - Dynamic metadata with SEO/OG tags
  - **Important**: `params` is a Promise in Next.js 15+, must await it

- **Components**:
  - `SupportRatioSVG`: Full-size Recharts visualization with tooltip, legend, axes
  - `CompactRatioChart`: Grid-view mini charts (clickable, color-coded)

### Charting Library
- Uses **Recharts** for all visualizations
- Components must have `"use client"` directive
- Custom tooltip for dark mode compatibility
- Lines: solid for estimates, dashed for projections
- Shaded area marks projection period

## Important Notes

### Next.js 15 Changes
- `params` in dynamic routes is now `Promise<{ slug: string }>` - must await before use
- Applies to both page components and `generateMetadata`

### Caching Strategy
- CSV is 2.3MB (exceeds Next.js 2MB cache limit)
- Solution: File-based cache with React's `cache()` for request deduplication
- **Don't use** Next.js fetch cache (`next.revalidate`) for the CSV - it will fail
- Cache file location: `.cache/owid-data.json` (add to `.gitignore`)

### Data Types
```typescript
RatioPoint = { year: number; ratio: number; type: "estimate" | "projection" }
CountrySeries = { entity: string; series: RatioPoint[]; latestEstimate?: RatioPoint }
DataPoint = { entity, year, wEst, eEst, wMed, eMed } // raw CSV data
```

### Color Coding (Support Ratio)
- **< 2**: Critical (red) - severe demographic pressure
- **2-4**: High pressure (orange)
- **4-6**: Moderate (yellow)
- **> 6**: Healthy (green)

### Adding New Countries
Update `SLUG_TO_ENTITY` in `owid.ts` for custom URL slugs. Otherwise, `slugToEntity()` falls back to lowercase entity name.

## Common Tasks

### Add new chart/visualization
1. Create `"use client"` component in `src/components/`
2. Use Recharts components
3. Include custom dark mode tooltip if needed
4. Use `#2563eb` for line colors (visible in both themes)

### Debug caching issues
- Check `.cache/owid-data.json` timestamp
- Clear cache: delete `.cache/` directory
- Verify `getCachedData()` is being called, not direct fetch

### Fix dark mode issues
- Always use explicit colors, not `currentColor` or CSS variables for Recharts
- Custom tooltip component with `dark:` variants for text/background
- Grid/axes: use `#888` for neutral visibility

## Data Source
- **URL**: https://ourworldindata.org/grapher/population-young-working-elderly-with-projections.csv
- **License**: CC BY (Our World in Data)
- **Update frequency**: Revalidate every 24h (86400s)
