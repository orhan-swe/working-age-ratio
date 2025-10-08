import { MetadataRoute } from 'next';
import { getAllCountries, entityToSlug } from '@/lib/owid';

export const revalidate = 86400; // 24h

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const countries = await getAllCountries();
  console.log(`Generating sitemap for ${countries.length} countries`);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';

  const countryPages = countries.map((country) => ({
    url: `${baseUrl}/country/${entityToSlug(country.entity)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...countryPages,
  ];
}
