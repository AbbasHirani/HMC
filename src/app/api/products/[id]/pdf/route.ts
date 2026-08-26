import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { findProductBySlug } from '@/lib/queries';
import { ProductPDF } from '@/lib/ProductPDF';

// NOTE: the [id] segment is a product *slug* here, not a UUID — unlike the
// sibling /api/products/[id] route, which takes the real id. ProductClient
// links to /api/products/${p.slug}/pdf.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;

  const product = await findProductBySlug(slug);
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(React.createElement(ProductPDF, { product }) as any);

  const filename = `${product.slug}-HMC.pdf`;
  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
