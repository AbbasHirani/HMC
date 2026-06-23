import { MetadataRoute } from 'next';
import { getAllProductSlugs, getBrands, getCategories } from '@/lib/queries';

export const revalidate = 3600; // Revalidate every hour

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hiranimarketing.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, brands, categories] = await Promise.all([
    getAllProductSlugs().catch(() => [] as string[]),
    getBrands().catch(() => []),
    getCategories().catch(() => []),
  ]);

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE}/`,            priority: 1.0, changeFrequency: 'weekly'  },
    { url: `${SITE}/catalogue`,   priority: 0.9, changeFrequency: 'daily'   },
    { url: `${SITE}/services`,    priority: 0.9, changeFrequency: 'monthly' },
    { url: `${SITE}/ta`,          priority: 0.9, changeFrequency: 'weekly'  },
    { url: `${SITE}/ta/services`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${SITE}/brands`,      priority: 0.6, changeFrequency: 'monthly' },
  ];

  const productUrls: MetadataRoute.Sitemap = slugs.map(slug => ({
    url: `${SITE}/product/${slug}`,
    priority: 0.8,
    changeFrequency: 'weekly',
  }));

  const brandUrls: MetadataRoute.Sitemap = brands.map(b => ({
    url: `${SITE}/brand/${b.slug}`,
    priority: 0.6,
    changeFrequency: 'weekly',
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map(c => ({
    url: `${SITE}/catalogue/${c.slug}`,
    priority: 0.8,
    changeFrequency: 'weekly',
  }));

  const subcategoryUrls: MetadataRoute.Sitemap = categories.flatMap(c => c.subs.map(s => ({
    url: `${SITE}/catalogue/${c.slug}/${s.slug}`,
    priority: 0.7,
    changeFrequency: 'weekly',
  })));

  return [...staticUrls, ...categoryUrls, ...subcategoryUrls, ...productUrls, ...brandUrls];
}
