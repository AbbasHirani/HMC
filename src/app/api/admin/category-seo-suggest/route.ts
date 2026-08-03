import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const API_KEY = process.env.GEMINI_API_KEY;

interface CatSeoSuggestBody {
  name?: string;
  teaser?: string;
  subs?: string[];
}

function buildPrompt(p: CatSeoSuggestBody): string {
  const subsList = p.subs?.length ? `- Product types / subcategories: ${p.subs.join(', ')}` : '';
  return `You are a senior SEO specialist writing metadata and copy for a local industrial equipment category page. Your output directly affects Google rankings and click-through rates.

THE BUSINESS:
Hirani Marketing Combines — authorised pump & water-systems dealer at Parrys, George Town, Chennai, Tamil Nadu. Est. 2008. Stocks genuine brands. In-house repair workshop. Target customers search Google for "[category] in Chennai", "[category] supplier Chennai", "[category] dealer Parrys", "buy [category] Chennai".

THE CATEGORY PAGE:
- Category / Page name: ${p.name || '(unnamed)'}
- Existing description / teaser: ${p.teaser || '(none)'}
${subsList}

GENERATE the following fields. Every rule is a hard requirement:

1. "title" — Meta title. HARD LIMIT: 50–60 characters (count carefully). Rules:
   - Front-load the primary category keyword as buyers would search it (e.g. "Water Pumps", "Chemical Pumps", "High Pressure Washers").
   - Include "Chennai" for local intent.
   - End with "| Hirani Marketing Combines" only if it fits within 60 chars.
   - If subcategories exist, you may include 1–2 of the most searched ones before the pipe.
   - NO keyword stuffing. Each word must earn its place.
   - NEVER use "HMC".
   - Example: "Water Pumps in Chennai | Centrifugal & Booster Pumps | HMC" ← bad, too long and uses HMC
   - Example: "Water Pumps Chennai | Hirani Marketing Combines" ← good

2. "description" — Meta description. HARD LIMIT: 145–160 characters TOTAL. Rules:
   - The ENTIRE description must be 145–160 characters — not more.
   - MUST be unique — do NOT use the template "Leading X supplier in Parrys...". Write a fresh, specific sentence for this category.
   - Open with what the category covers and who it's for (industrial, residential, commercial use as relevant).
   - Mention 2–3 specific product types from the subcategories list if available.
   - Include "Chennai" and "Hirani Marketing Combines" or "Parrys" naturally.
   - End with a CTA: "Shop now.", "Call for pricing.", "Visit our Parrys store.", or "Get expert advice."
   - Example good description: "Buy centrifugal, booster & submersible pumps in Chennai at Hirani Marketing Combines. Genuine brands, workshop support, Parrys store. Call for pricing."

3. "keywords" — Comma-separated string of 15–18 keywords. Rules:
   - Include: category name, each subcategory name, category + "Chennai", category + "price", category + "dealer Chennai", category + "supplier Parrys".
   - Include transactional long-tails: "buy [category] in Chennai", "[category] near me", "[category] authorised dealer Chennai".
   - Include "Hirani Marketing Combines" as one keyword.
   - Lowercase except proper nouns.
   - NO vague filler terms.

4. "teaser" — Short category description shown on cards and at top of category page. LIMIT: 100–130 characters. Rules:
   - One well-structured sentence.
   - Describe what this category includes and its primary real-world applications.
   - Professional industrial tone — no marketing hyperbole.
   - Must be unique and specific to this category, not generic.
   - Example: "Centrifugal, booster and submersible pumps for domestic, commercial and industrial water supply needs."

5. "footText" — Short text at bottom of category card. Rules:
   - If subcategories are provided: count them and write e.g. "6 types", "4 product types".
   - If no subcategories: write "View range".

Return ONLY valid JSON with keys: title, description, keywords, teaser, footText.`;
}

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 503 });
  }

  let body: CatSeoSuggestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Category name is required — fill it in first.' }, { status: 400 });
  }

  const geminiBody = {
    contents: [{ role: 'user', parts: [{ text: buildPrompt(body) }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          description: { type: 'STRING' },
          keywords: { type: 'STRING' },
          teaser: { type: 'STRING' },
          footText: { type: 'STRING' },
        },
        required: ['title', 'description', 'keywords', 'teaser', 'footText'],
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
      teaser: String(parsed.teaser ?? ''),
      footText: String(parsed.footText ?? ''),
    });
  } catch {
    return NextResponse.json({ error: 'AI returned an unexpected response. Try again.' }, { status: 502 });
  }
}
