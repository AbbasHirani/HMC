import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Same Gemini setup as /api/chat — swappable via env.
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const API_KEY = process.env.GEMINI_API_KEY;

/** A single Gemini content part: prompt text, or an inlined image. */
type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

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
  images?: { type: 'url' | 'base64'; data: string; mime?: string }[];
}

function buildPrompt(p: SeoSuggestBody): string {
  const specLines = Object.entries(p.specs ?? {}).map(([k, v]) => `  - ${k}: ${v}`).join('\n');
  return `You are a senior SEO specialist writing metadata for a local e-commerce product page. Your output directly affects Google rankings and click-through rates in Chennai, India.

THE BUSINESS:
Hirani Marketing Combines — authorised pump & water-systems dealer at Parrys, George Town, Chennai, Tamil Nadu. Est. 2008. Stocks genuine brands. In-house repair workshop.

Target buyer search patterns (examples of how REAL customers type into Google):
  "buy [product] in Chennai", "[product] price Chennai", "[brand] [product] dealer near me",
  "[HP/LPM spec] [product type] Chennai", "[model number] [product type]", "[product] supplier Parrys"

THE PRODUCT:
- Name: ${p.name || '(unnamed)'}
- Brand: ${p.brand || 'unbranded'}
- Category: ${p.category || '-'}
- Subcategory / product type: ${p.subcategory || '-'}
- Price: ${p.price ? `₹${p.price}` : 'on request / call for price'}
- Description: ${p.desc || '(none)'}
${specLines ? `- Specifications:\n${specLines}` : ''}
${p.useCases?.length ? `- Use cases / applications: ${p.useCases.join(', ')}` : ''}
- Number of product images: ${p.imageCount ?? 0}

GENERATE the following fields. Follow every rule exactly — character counts are hard limits:

1. "title" — Meta title. HARD LIMIT: 50–60 characters TOTAL. Count every character including spaces.
   PRIORITY ORDER for what to include (fit as much as possible within 60 chars):
   a. Exact product name / model number — this is mandatory and must come first.
   b. The single most-searched spec if the product has one (e.g., "1 HP", "50 LPM", "6 bar", "100 GPD") — buyers search "[spec] [product type] Chennai" more than generic names.
   c. "Chennai" — mandatory for local SEO.
   d. "| Hirani Marketing Combines" — only if it fits after a+b+c within 60 chars.
   RULES:
   - Front-load the exact model number / product name as typed by buyers — do not reorder it.
   - If spec is included, place it immediately after the product name (e.g., "CRI COMET-2 1HP Pump Chennai").
   - NO punctuation gimmicks. NO mid-title pipes except before brand name at the end.
   - NEVER use the abbreviation "HMC". NEVER add "Buy" at the start.
   - Count the characters of your output before returning it. If it exceeds 60, trim from the end.

2. "description" — Meta description. HARD LIMIT: 145–160 characters TOTAL. Count every character.
   FORMULA: [Exact buyer search phrase] + [one differentiating spec or benefit] + [local CTA].
   RULES:
   - Start with the EXACT PHRASE buyers type into Google — typically "[Brand] [Model]" or "[Spec] [Product Type]". Do NOT start with "Buy" or generic copy.
   - Include the single most important spec or benefit (the one that makes this product different from cheaper alternatives).
   - Include "Chennai" and "Hirani Marketing Combines" at least once between them.
   - End with a clear transactional CTA: "Call for price.", "Get a quote today.", or "Visit our Parrys store."
   - Maximum two short sentences. No bullet points.
   - NEVER use "HMC". Count the characters — must be 145–160 total.

3. "keywords" — Comma-separated string of 14–20 keywords. Rules:
   REQUIRED keyword types (include ALL of these):
   a. Exact product name as written
   b. Brand + product combo (e.g., "CRI COMET-2 pump")
   c. Spec-based queries if specs are available: "[HP] [product type]", "[LPM] pump Chennai", "[bar] pressure pump" — these are high-converting searches
   d. Local transactional: "[product] in Chennai", "[product] price Chennai", "[product] dealer Chennai", "[product] supplier Parrys", "[brand] dealer Chennai"
   e. Buyer-intent long-tails: "buy [product] Chennai", "[product] authorised dealer", "[brand] [product] price"
   f. Use-case keywords if provided (e.g., if use case is "apartment", add "[product] for apartments Chennai")
   g. Common alternate names / spellings (e.g., "hydro test pump" and "hydrostatic test pump" and "hydraulic test pump" — buyers spell these differently)
   h. "Hirani Marketing Combines" as one keyword
   - Lowercase except proper nouns and brand names. NO generic fillers like "best", "top", "cheap".

4. "imageAlts" — Array of EXACTLY ${Math.max(p.imageCount ?? 0, 0)} alt text strings (empty array if 0 images). Rules:
   - Describe EXACTLY what is physically visible in each image (front view, side view, nameplate, label, packaging, angle, etc.) — the images are passed to you so look at them carefully.
   - Each alt text: 80–120 characters, unique per image, includes the product name.
   - First image: include brand name and "Hirani Marketing Combines, Chennai".
   - Subsequent images: vary phrasing, focus on what is visibly different (angle, detail, rating label).
   - NEVER start with "image of", "photo of", or "picture of". NEVER use "HMC".

Return ONLY valid JSON with keys: title, description, keywords, imageAlts.`;
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

  const parts: GeminiPart[] = [{ text: buildPrompt(body) }];

  if (body.images) {
    for (const img of body.images) {
      if (img.type === 'base64' && img.data) {
        parts.push({ inlineData: { mimeType: img.mime || 'image/jpeg', data: img.data } });
      } else if (img.type === 'url' && img.data) {
        try {
          const r = await fetch(img.data);
          if (r.ok) {
            const buf = await r.arrayBuffer();
            parts.push({
              inlineData: {
                mimeType: r.headers.get('content-type') || 'image/jpeg',
                data: Buffer.from(buf).toString('base64'),
              }
            });
          }
        } catch {
          console.error("Failed to fetch image for AI:", img.data);
        }
      }
    }
  }

  const geminiBody = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0.2,
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
