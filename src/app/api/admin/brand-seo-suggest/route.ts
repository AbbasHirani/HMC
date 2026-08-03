import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const API_KEY = process.env.GEMINI_API_KEY;

interface BrandSeoSuggestBody {
  name?: string;
  description?: string;
  products?: { name: string; category: string; subcategory: string }[];
}

function buildPrompt(p: BrandSeoSuggestBody): string {
  const productLines = p.products?.length
    ? p.products.slice(0, 20).map(pr => `  - ${pr.name} (${pr.category} / ${pr.subcategory})`).join('\n')
    : '  (no products listed yet — infer from brand name and description)';

  return `You are a senior SEO specialist writing metadata for a brand page on a local industrial equipment store.

THE BUSINESS:
Hirani Marketing Combines — authorised pump & water-systems dealer in Parrys, Chennai, Tamil Nadu. Est. 2008. Stocks genuine brands with an in-house repair workshop. Customers search for "[brand] dealer Chennai", "[brand] products Chennai", "buy [brand] in Chennai".

THE BRAND PAGE:
- Brand name: ${p.name || '(unnamed)'}
- Brand description (if any): ${p.description || '(none provided)'}
- Products this brand sells at Hirani Marketing Combines:
${productLines}

IMPORTANT: Generate SEO metadata that is 100% accurate to what this brand actually sells. Do NOT invent product categories — use only what is listed above. If no products are listed, be conservative and only describe what the brand name and description suggest.

GENERATE the following fields:

1. "title" — Meta title. HARD LIMIT: 50–60 characters (count carefully). Rules:
   - Format: "[Brand Name] [primary product type] in Chennai | Hirani Marketing Combines"
   - Use the most prominent product type from the products list.
   - Include "Chennai" for local intent.
   - NEVER use "HMC". NEVER exceed 60 characters.
   - Example: "BTALI Pump Controllers in Chennai | Hirani Marketing Combines"

2. "description" — Meta description. HARD LIMIT: 145–160 characters TOTAL. Rules:
   - The ENTIRE description must be 145–160 characters — not a character more.
   - Mention the brand name, the specific types of products they make (from the product list), and "Chennai".
   - Include "Hirani Marketing Combines" or "Parrys" naturally.
   - End with a CTA: "Call for pricing.", "Visit our Parrys store.", or "Browse the range."
   - NEVER use "HMC". Do NOT invent products not in the list.
   - Example: "Browse BTALI automatic pump controllers and accessories at Hirani Marketing Combines, Chennai. Dry-run protection, pressure control. Call for pricing."

3. "keywords" — Comma-separated string of 12–16 keywords. Rules:
   - Include: brand name alone, brand + each main product type, brand + "Chennai", brand + "dealer Chennai", brand + "authorised dealer", brand + "price".
   - Include "Hirani Marketing Combines" as one keyword.
   - Only use product types that actually appear in the products list.
   - Lowercase except proper nouns/brand names.

4. "brandDescription" — A short brand description for the brand page body. LIMIT: 80–120 characters. Rules:
   - One clean sentence describing what this brand makes, based strictly on the products list.
   - Professional tone. No superlatives.
   - Example: "Browse all BTALI automatic pump controllers and accessories available at Hirani Marketing Combines, Chennai."

Return ONLY valid JSON with keys: title, description, keywords, brandDescription.`;
}

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 503 });
  }

  let body: BrandSeoSuggestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Brand name is required — fill it in first.' }, { status: 400 });
  }

  const geminiBody = {
    contents: [{ role: 'user', parts: [{ text: buildPrompt(body) }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          description: { type: 'STRING' },
          keywords: { type: 'STRING' },
          brandDescription: { type: 'STRING' },
        },
        required: ['title', 'description', 'keywords', 'brandDescription'],
      },
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });
  } catch {
    return NextResponse.json({ error: 'Could not reach the AI service.' }, { status: 502 });
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '');
    console.error('Gemini brand SEO suggest error', upstream.status, detail);
    return NextResponse.json({ error: 'AI generation failed. Try again.' }, { status: 502 });
  }

  try {
    const json = await upstream.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text);
    return NextResponse.json({
      title: String(parsed.title ?? ''),
      description: String(parsed.description ?? ''),
      keywords: String(parsed.keywords ?? ''),
      brandDescription: String(parsed.brandDescription ?? ''),
    });
  } catch {
    return NextResponse.json({ error: 'AI returned an unexpected response. Try again.' }, { status: 502 });
  }
}
