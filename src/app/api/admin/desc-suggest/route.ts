import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const API_KEY = process.env.GEMINI_API_KEY;

interface DescSuggestBody {
  name?: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  specs?: Record<string, string>;
}

function buildPrompt(p: DescSuggestBody): string {
  const specLines = Object.entries(p.specs ?? {}).map(([k, v]) => `  - ${k}: ${v}`).join('\n');
  return `You are a senior product copywriter for an industrial equipment e-commerce store. Write a product description that ranks well on Google AND converts buyers.

THE BUSINESS:
Hirani Marketing Combines — authorised pump & water-systems dealer in Parrys, Chennai, Tamil Nadu. Est. 2008. Customers: homeowners, facility managers, plumbing contractors, and industrial buyers across Tamil Nadu.

THE PRODUCT:
- Name: ${p.name || '(unnamed)'}
- Brand: ${p.brand || 'unbranded'}
- Category: ${p.category || '-'}
- Subcategory: ${p.subcategory || '-'}
${specLines ? `- Known Specifications:\n${specLines}` : ''}

WRITING INSTRUCTIONS — follow every rule exactly:

1. LENGTH: Write 320–420 words. Non-negotiable — Google ranks thin pages lower. Fill every word with genuinely useful technical information; do not pad.

2. STRUCTURE — four sections in order, each separated by a blank line:

   SECTION 1 — Opening paragraph (2–3 sentences):
   - State clearly what the product is, what problem it solves, and its primary technical strength.
   - If specs are available, include the most-searched numeric spec (HP, kW, LPM, bar, GPD, etc.) in the EXACT FORMAT buyers search for — e.g., "1.5 HP", "50 LPM", "6 bar". Google ranks pages that match the search query format.
   - Naturally include the product name/model and the brand name in this paragraph.

   SECTION 2 — Key Features paragraph (4–6 sentences):
   - Describe build quality, materials, mechanical design, and key specs in flowing prose (no bullet points).
   - Use LSI (semantically related) technical terms that Google associates with this product type. Examples: for pumps → impeller type, mechanical seal, motor winding, bearing type, casing material; for filters → membrane type, TDS rejection, micron rating, flow rate; for compressors → cylinder bore, piston stroke, tank capacity, duty cycle. Using these terms signals relevance to Google's algorithm beyond exact keywords.
   - Explain WHY the key specs matter — e.g., "The PVDF casing resists corrosive acids and alkalis, making it suitable for chemical transfer without seal degradation."

   SECTION 3 — Performance & Applications paragraph (3–4 sentences):
   - Describe real-world performance: how it behaves under load, at rated conditions, at partial flow.
   - Name 4–6 specific real-world installation scenarios — be industry-specific (e.g., apartment overhead tank boosting, factory cooling water circuit, RO plant feed line, car wash bay, fire hydrant system, chemical dosing in ETP/STP, boiler feed, irrigation main).
   - Mention the geographic/climate context where relevant (e.g., "suitable for Tamil Nadu's hard water conditions").

   SECTION 4 — Closing sentence (1 sentence):
   - State it is available at Hirani Marketing Combines, Parrys, Chennai, with expert advice and workshop after-sales service.

3. SEO KEYWORD RULES:
   - Include the full product name / model number at least 3 times across the description — naturally, never forced.
   - Include "Chennai" at least once (closing sentence).
   - Include "Hirani Marketing Combines" exactly once — closing sentence only. NEVER use the abbreviation "HMC".
   - If alternate names or spellings exist for this product type, work ONE into the text naturally (e.g., "hydrostatic test pump" alongside "hydro test pump").

4. TONE:
   - Professional, factual, and confident. No superlatives: no "best-in-class", "world-class", "unmatched", "revolutionary", "state-of-the-art".
   - Write for a technical buyer who wants facts. Short sentences. Active voice.
   - No filler phrases: no "In conclusion", "Overall", "It is worth noting".

5. DO NOT include: section headers or labels (no bold "Key Features:", no "Applications:"), bullet points, Markdown, pricing, availability claims like "in stock", or any preamble like "Sure, here is...".

6. Return ONLY the plain text description — four paragraphs separated by blank lines, nothing else.`;
}

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 503 });
  }

  let body: DescSuggestBody;
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
    console.error('Gemini DESC suggest error', upstream.status, detail);
    return NextResponse.json({ error: 'AI generation failed. Try again.' }, { status: 502 });
  }

  try {
    const json = await upstream.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return NextResponse.json({ description: text.trim() });
  } catch {
    return NextResponse.json({ error: 'AI returned an unexpected response. Try again.' }, { status: 502 });
  }
}
