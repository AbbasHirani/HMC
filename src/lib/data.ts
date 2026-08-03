// Static constants + TypeScript types — safe to import in client components

export const CONTACT = {
  phone: '+91 98401 59762',
  phoneHref: 'tel:+919840159762',
  whatsapp: '919840159762',
  email: 'hiranimarketingcombines@gmail.com',
  emailAlt: 'hirani.marketing@yahoo.in',
  address: 'Old No.133 / New No.279, Thambu Chetty St, opposite TNEB office, Parrys, George Town, Chennai – 600001',
  since: '2008',
};

export const BRANDS: { name: string; slug: string }[] = [
  { name: 'Kent',      slug: 'kent' },
  { name: 'Aquaguard', slug: 'aquaguard' },
  { name: 'CRI',       slug: 'cri' },
  { name: 'Kirloskar', slug: 'kirloskar' },
  { name: 'Grundfos',  slug: 'grundfos' },
  { name: 'Crompton',  slug: 'crompton' },
  { name: 'Texmo',     slug: 'texmo' },
  { name: 'Shakti',    slug: 'shakti' },
  { name: 'Wilo',      slug: 'wilo' },
  { name: 'Pentair',   slug: 'pentair' },
];

export const WA_BASE = `https://wa.me/${CONTACT.whatsapp}?text=`;
export const WA = WA_BASE + encodeURIComponent("Hi Hirani Marketing Combines, I'd like an enquiry about ");

export interface Service { name: string; desc: string }
export const SERVICES: Service[] = [
  { name: 'Pump Repair & Reconditioning',      desc: 'Inspection, part replacement, performance restoration and testing.' },
  { name: 'Water Filter Repair & Maintenance', desc: 'Cartridge replacement, system checks and servicing for RO, UV and softeners.' },
  { name: 'Air Compressor Repair',             desc: 'Repair and maintenance for air compressors across Chennai.' },
  { name: 'Hydraulic System Maintenance',      desc: 'Maintenance and servicing of hydraulic power packs and components.' },
];

// ─── Shared types (used by both server + client components) ──────────────────

export interface Category {
  _id: string;
  slug: string;
  id: string;
  name: string;
  icon: string;
  teaser: string;
  foot: string;
  footText: string;
  imageUrl?: string;
  imagePublicId?: string;
  order: number;
  seo: { title?: string; description?: string; keywords?: string };
  subs: FlatSubCategory[];
}

export interface FlatSubCategory {
  _id: string;
  id: string;
  slug: string;
  cat: string;
  name: string;
  blurb: string;
  count: number;
  seo: { title?: string; description?: string; keywords?: string };
}

export interface Product {
  _id: string;
  slug: string;
  name: string;
  cat: string;
  sub: string;
  subName: string;
  catName?: string;
  desc: string;
  spec?: string;
  price: number | null;
  tag: string | null;
  featured: boolean;
  images: Array<{ url: string; publicId: string; alt?: string }>;
  videos?: Array<{ type: 'cloudinary' | 'youtube'; url: string; publicId?: string }>;
  specs: Record<string, string>;
  brand?: string | null;
  brandName?: string | null;
  brandLogo?: string | null;
  useCases?: string[];
  ucSlugs?: string[];
  seo?: ProductSeo;
}

export interface ProductSeo {
  title?: string;
  description?: string;
  keywords?: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  order: number;
  description?: string | null;
  seo?: { title?: string; description?: string; keywords?: string } | null;
}
