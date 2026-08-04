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
    : '  (no products listed yet — infer conservatively from brand name and description only)';

  return `You are a senior SEO specialist writing metadata and copy for a brand page on a local industrial equipment store. Your output directly affects Google rankings in Chennai, India.

THE BUSINESS:
Hirani Marketing Combines — authorised pump & water-systems dealer in Parrys, Chennai, Tamil Nadu. Est. 2008. Stocks genuine brands with in-house repair workshop. Customers search: "[brand] dealer Chennai", "[brand] authorised dealer", "buy [brand] in Chennai", "[brand] [product type] price Chennai".

THE BRAND PAGE:
- Brand name: ${p.name || '(unnamed)'}
- Brand description (if any): ${p.description || '(none provided)'}
- Products stocked at Hirani Marketing Combines:
${productLines}

IMPORTANT: Generate SEO metadata accurate to what this brand actually sells. Do NOT invent product categories — use only what is listed above.

KEYWORD INTELLIGENCE — search patterns buyers use for pump/equipment brands in Chennai:
- Brand searches: "[brand] dealer Chennai", "[brand] authorised dealer Chennai", "[brand] distributor Chennai", "[brand] price Chennai", "buy [brand] Chennai"
- Product-type searches: "[brand] [product type] Chennai", "[brand] [product type] price", "[brand] [spec] [product type]" (e.g. "CRI 1 HP monoblock pump")
- Alternate product names to include where relevant: monoblock = centrifugal = self-priming; hydro test = hydraulic test = hydrostatic test; dosing pump = metering pump; sewage pump = drainage pump
- Trust searches: "[brand] genuine dealer Chennai", "[brand] original products Chennai"

GENERATE the following fields:

1. "title" — Meta title. HARD LIMIT: 50–60 characters (count every character). Rules:
   - Format: "[Brand] [primary product type] in Chennai | Hirani Marketing Combines" — trim as needed to stay within 60 chars.
   - Use the most prominent product type from the products list.
   - Include "Chennai".
   - NEVER use "HMC". Count characters before returning.

2. "description" — Meta description. HARD LIMIT: 145–160 characters TOTAL. Rules:
   - Must be exactly 145–160 characters — count every character.
   - Mention the brand name, 2–3 specific product types from the products list, and "Chennai".
   - Include "Hirani Marketing Combines" or "Parrys" naturally.
   - End with a CTA: "Call for pricing.", "Visit our Parrys store.", or "Browse the range."
   - NEVER use "HMC". Do NOT invent products not in the list.

3. "keywords" — Comma-separated string of 14–18 keywords. Rules:
   REQUIRED types — all must be present:
   a. Brand name alone
   b. Brand + each main product type it sells (from products list)
   c. Brand + "Chennai", brand + "dealer Chennai", brand + "authorised dealer", brand + "price"
   d. Brand + specific product combos: "[brand] [product] price Chennai", "[brand] [product] dealer Chennai"
   e. Alternate product names where applicable (see Keyword Intelligence above)
   f. "Hirani Marketing Combines" as one keyword
   Only use product types that appear in the products list. Lowercase except brand/proper nouns.

4. "brandDescription" — Brand page body paragraph. TARGET: 55–80 words. Rules:
   - Write 2–3 complete sentences. This is body copy displayed on the brand page — more words means more indexable content for Google.
   - Sentence 1: state what the brand makes and its primary product range (based strictly on the products list).
   - Sentence 2: describe who typically buys this brand and for what applications (residential, commercial, industrial, ETP/STP, HVAC, etc.) — be specific to this brand's actual product types.
   - Sentence 3: state it is available at Hirani Marketing Combines, Parrys, Chennai with genuine stock and after-sales support.
   - Must include the brand name at least twice naturally.
   - Professional tone. No superlatives.

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
      temperature: 0.2,
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
