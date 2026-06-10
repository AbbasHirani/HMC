import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import ProductForm from '../../ProductForm';

interface Props { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  let product: Record<string, unknown>,
    cats: { _id: string; name: string; slug: string }[],
    subs: { _id: string; name: string; slug: string; categoryId: string }[],
    brands: { _id: string; name: string; slug: string; logoUrl: string | null }[],
    useCases: { _id: string; name: string; slug: string }[],
    productUseCaseIds: string[];
  try {
    const prodRows = await sql`SELECT * FROM products WHERE id = ${id}`;
    if (!prodRows[0]) notFound();
    const [catRows, subRows, brandRows, ucRows, productUcRows] = await Promise.all([
      sql`SELECT id, name, slug FROM categories ORDER BY sort_order`,
      sql`SELECT id, name, slug, category_id FROM subcategories ORDER BY sort_order`,
      sql`SELECT id, name, slug, logo_url FROM brands ORDER BY sort_order, name`,
      sql`SELECT id, name, slug FROM use_cases ORDER BY name`,
      sql`SELECT use_case_id FROM product_use_cases WHERE product_id = ${id}`,
    ]);
    product = prodRows[0];
    cats = catRows.map(c => ({ _id: c.id as string, name: c.name as string, slug: c.slug as string }));
    subs = subRows.map(s => ({
      _id: s.id as string, name: s.name as string, slug: s.slug as string,
      categoryId: s.category_id as string,
    }));
    brands = brandRows.map(b => ({
      _id: b.id as string, name: b.name as string, slug: b.slug as string,
      logoUrl: (b.logo_url as string | null) ?? null,
    }));
    useCases = ucRows.map(u => ({ _id: u.id as string, name: u.name as string, slug: u.slug as string }));
    productUseCaseIds = productUcRows.map(r => r.use_case_id as string);
  } catch { notFound(); }

  return (
    <>
      <div className="adm-topbar"><h1>Edit Product</h1></div>
      <div className="adm-content">
        <div className="adm-ph">
          <h2>Edit: {product!.name as string}</h2>
          <a href="/admin/products" className="btn-adm btn-adm-ghost">← Back</a>
        </div>
        <ProductForm
          mode="edit"
          id={id}
          cats={cats!}
          allSubs={subs!}
          brands={brands!}
          useCases={useCases!}
          initial={{
            name: product!.name as string,
            slug: product!.slug as string,
            categoryId: product!.category_id as string,
            subcategoryId: product!.subcategory_id as string,
            desc: (product!.description as string) ?? '',
            price: product!.price != null ? String(product!.price) : '',
            tag: (product!.tag as string) ?? '',
            featured: (product!.featured as boolean) ?? false,
            brand: (product!.brand as string) ?? '',
            specs: (product!.specs as Record<string, string>) ?? {},
            images: (product!.images as Array<{ url: string; publicId: string; alt?: string }>) ?? [],
            useCaseIds: productUseCaseIds!,
            seo: (product!.seo as { title?: string; description?: string; keywords?: string }) ?? {},
          }}
        />
      </div>
    </>
  );
}
