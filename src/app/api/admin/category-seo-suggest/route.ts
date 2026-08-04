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
  return `You are a senior SEO specialist writing metadata and page copy for a local industrial equipment category page. Your output directly affects Google rankings in Chennai, India.

THE BUSINESS:
Hirani Marketing Combines — authorised pump & water-systems dealer at Parrys, George Town, Chennai, Tamil Nadu. Est. 2008. Stocks genuine brands (CRI, Kirloskar, Grundfos, Pentair, Lubi). In-house repair workshop. Customers: homeowners, facility managers, plumbing contractors, industrial buyers across Tamil Nadu.

THE CATEGORY PAGE:
- Category / Page name: ${p.name || '(unnamed)'}
- Existing description / teaser: ${p.teaser || '(none)'}
${subsList}

KEYWORD INTELLIGENCE — how buyers in Chennai actually search for each product type:
- Water pumps / monoblock: "monoblock pump Chennai", "1 HP monoblock pump", "centrifugal pump Chennai", "self priming pump" (alternate name), "0.5 HP / 1.5 HP water pump Chennai"
- Submersible pumps: "submersible pump Chennai", "sewage pump Chennai", "drainage pump", "DC submersible pump", "plastic submersible pump", "openwell pump"
- Chemical pumps: "chemical dosing pump Chennai", "dosing pump", "metering pump" (alternate name), "acid transfer pump", "PVDF pump", "PP pump"
- Pressure booster: "pressure booster pump Chennai", "booster pump for apartment Chennai", "water pressure pump", "low water pressure solution"
- High pressure washers: "high pressure washer Chennai", "car wash pump Chennai", "industrial pressure washer", "jet washer" / "power washer" (alternate names)
- Hydraulic / hydro test pumps: "hydro test pump Chennai", "hydraulic test pump", "hydrostatic test pump" — all three spellings used by different buyers; "hand operated test pump", "pipeline pressure test pump"
- Diesel / engine pumps: "diesel water pump Chennai", "dewatering pump Chennai", "portable diesel pump", "engine pump set"
- Air equipment: "air compressor dealer Chennai", "piston compressor", "compressed air equipment"
- Plunger pumps: "plunger pump Chennai", "high pressure plunger pump", "reciprocating pump" (alternate name)

GENERATE the following fields. Every rule is a hard requirement:

1. "title" — Meta title. HARD LIMIT: 50–60 characters (count every character including spaces). Rules:
   - Front-load the primary keyword buyers search (e.g. "Submersible Pumps", "Chemical Dosing Pumps") — use the most common search phrasing, not the internal category name if they differ.
   - Include "Chennai" for local intent.
   - End with "| Hirani Marketing Combines" only if it fits within 60 chars total.
   - NEVER use "HMC". Count characters before returning.

2. "description" — Meta description. HARD LIMIT: 145–160 characters TOTAL. Rules:
   - Must be 145–160 characters — count every character.
   - Open with the primary buyer search phrase for this category (e.g. "Submersible pumps in Chennai").
   - Name 2–3 specific product types from subcategories if available.
   - Include "Hirani Marketing Combines" or "Parrys".
   - End with a CTA: "Call for pricing.", "Visit our Parrys store.", or "Get expert advice."
   - NEVER use "HMC".

3. "keywords" — Comma-separated string of 16–20 keywords. Rules:
   REQUIRED types — all must be present:
   a. Primary category name as buyers search it
   b. Each subcategory name (if provided)
   c. Alternate names / spellings for this product type (use the Keyword Intelligence section above)
   d. Spec-based searches where relevant: "[HP] [product type] Chennai", "[LPM] pump", etc.
   e. Local transactional: "[category] dealer Chennai", "[category] supplier Parrys", "[category] price Chennai", "buy [category] Chennai"
   f. "[category] authorised dealer Chennai"
   g. "Hirani Marketing Combines"
   Lowercase except brand names. No vague fillers.

4. "teaser" — Category description shown on listing cards AND as body text on the category page itself. TARGET: 55–80 words. Rules:
   - Write 2–3 complete sentences. This is body copy, not a tagline — it must contain enough keywords for Google to understand the page topic.
   - Sentence 1: state what this category covers, naming the specific product variants and alternate names included.
   - Sentence 2: describe primary real-world applications and who buys them (homeowners, factories, plumbing contractors, ETP/STP plants, facility managers, etc.).
   - Sentence 3 (optional but recommended): mention spec range or a key differentiator (e.g. "Available from 0.5 HP to 10 HP for domestic and industrial supply lines").
   - Must include at least 2 high-priority keywords from the Keyword Intelligence section above, worked in naturally.
   - Professional, factual tone. No superlatives ("best", "leading", "top").

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
      temperature: 0.2,
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
    console.error('Gemini category SEO suggest error', upstream.status, detail);
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
