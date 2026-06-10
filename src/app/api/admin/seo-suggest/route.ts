import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Same Gemini setup as /api/chat — swappable via env.
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const API_KEY = process.env.GEMINI_API_KEY;

interface SeoSuggestBody {
  name?: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  desc?: string;
  price?: number | null;
  specs?: Record<string, string>;
  useCases?: string[];
  imageCount?: number;
}

function buildPrompt(p: SeoSuggestBody): string {
  const specLines = Object.entries(p.specs ?? {}).map(([k, v]) => `  - ${k}: ${v}`).join('\n');
  return `You are an expert e-commerce SEO copywriter for a local business. Generate SEO metadata for the product page below.

THE BUSINESS:
Hirani Marketing Combines (HMC) — a pump & water-systems dealer in Parrys, George Town, Chennai, Tamil Nadu, India. Running since 2008. Authorised dealer of genuine brands with an in-house repair workshop. Customers search Google for things like "buy <product> in Chennai", "<product> price Chennai", "<brand> <product> dealer near me".

THE PRODUCT:
- Name: ${p.name || '(unnamed)'}
- Brand: ${p.brand || 'unbranded'}
- Category: ${p.category || '-'}
- Subcategory / product type: ${p.subcategory || '-'}
- Price: ${p.price ? `₹${p.price}` : 'on request'}
- Description: ${p.desc || '(none)'}
${specLines ? `- Specifications:\n${specLines}` : ''}
${p.useCases?.length ? `- Use cases / applications: ${p.useCases.join(', ')}` : ''}
- Number of product images: ${p.imageCount ?? 0}

GENERATE (follow these rules strictly):
1. "title" — meta title, 58–65 characters. Use the full space — do not waste it. Front-load the primary keyword (product + type). Include the brand if it has search value and "Chennai" for local intent. Compelling, not keyword-stuffed.
2. "description" — meta description, 280–320 characters. Use as close to 320 as possible without going over. Structure it so the FIRST 155 characters work standalone (primary keyword + key benefit + Chennai — this is what shows in search results), then continue with specs, use cases, dealer credibility (authorised dealer, since 2008, Parrys) and end with a call to action (e.g. "Call for best price"). Must read like a human wrote it.
3. "keywords" — a single comma-separated string of 15–20 keywords/phrases. Mix: primary keyword, brand+product combos, local variants ("... in Chennai", "... price", "... dealer near me"), buyer-intent long-tails ("best ... for home", "... for borewell"), and the use cases. Lowercase except brand names.
4. "imageAlts" — an array of EXACTLY ${Math.max(p.imageCount ?? 0, 0)} alt texts (empty array if 0 images). Each one descriptive and specific (what the image likely shows: front view, side view, in use, nameplate/specs). Include the product name + brand naturally; vary the phrasing; 80–125 characters each. Never start with "image of" or "photo of".

Return ONLY the JSON object.`;
}

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 503 });
  }

  let body: SeoSuggestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Product name is required — fill it in first.' }, { status: 400 });
  }

  const geminiBody = {
    contents: [{ role: 'user', parts: [{ text: buildPrompt(body) }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          description: { type: 'STRING' },
          keywords: { type: 'STRING' },
          imageAlts: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: ['title', 'description', 'keywords', 'imageAlts'],
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
    console.error('Gemini SEO suggest error', upstream.status, detail);
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
      imageAlts: Array.isArray(parsed.imageAlts) ? parsed.imageAlts.map(String) : [],
    });
  } catch {
    return NextResponse.json({ error: 'AI returned an unexpected response. Try again.' }, { status: 502 });
  }
}
