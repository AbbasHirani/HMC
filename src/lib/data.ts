// Static constants + TypeScript types — safe to import in client components

export const CONTACT = {
  phone: '+91 98XXX XXXXX',
  phoneHref: 'tel:+9198XXXXXXXX',
  whatsapp: '919XXXXXXXXX',
  email: 'sales@hiranimarketing.in',
  address: 'Parrys, Chennai, Tamil Nadu',
  since: '2008',
};

export const BRANDS = ['Kent', 'Aquaguard', 'CRI', 'Kirloskar', 'Grundfos', 'Crompton'];

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
  images: Array<{ url: string; publicId: string }>;
  specs: Record<string, string>;
}
