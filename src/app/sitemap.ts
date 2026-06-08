import { MetadataRoute } from 'next';
import { getAllProductSlugs, getBrands } from '@/lib/queries';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hiranimarketing.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, brands] = await Promise.all([
    getAllProductSlugs().catch(() => [] as string[]),
    getBrands().catch(() => []),
  ]);

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE}/`,          priority: 1.0, changeFrequency: 'weekly'  },
    { url: `${SITE}/catalogue`, priority: 0.9, changeFrequency: 'daily'   },
    { url: `${SITE}/services`,  priority: 0.9, changeFrequency: 'monthly' },
    { url: `${SITE}/brands`,    priority: 0.6, changeFrequency: 'monthly' },
    { url: `${SITE}/llms.txt`,  priority: 0.3, changeFrequency: 'monthly' },
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

  return [...staticUrls, ...productUrls, ...brandUrls];
}
