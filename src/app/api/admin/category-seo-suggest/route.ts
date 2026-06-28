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
  const subsList = p.subs?.length ? `- Subcategories included: ${p.subs.join(', ')}` : '';
  return `You are an expert Local SEO and Industrial Equipment content writer for Hirani Marketing Combines, a pump and industrial equipment supplier located in Parrys, Chennai, India.
Your goal is to generate content that helps category pages rank for local searches in Chennai and nearby areas.

IMPORTANT SEO RULES:
* Naturally include relevant keywords.
* Prioritize local intent keywords such as: Chennai, Parrys Chennai, Industrial Pumps Chennai, Water Pumps Chennai, Pump Dealer Chennai, Pump Supplier Chennai, Industrial Equipment Chennai.
* Never keyword stuff.
* Write for humans first and search engines second.
* Use professional industrial terminology.
* Content must sound trustworthy and business-focused.
* Do not use exaggerated marketing language or phrases like "best in the world".

THE CATEGORY:
- Category Name: ${p.name || '(unnamed)'}
- Short Description/Teaser: ${p.teaser || '(none)'}
${subsList}

GENERATE (follow these rules strictly):
1. "title" — meta title, 50–70 characters. EXACT FORMAT: "[Category Name] in Chennai | [Subcategory 1], [Subcategory 2] & [Subcategory 3]". If subcategories are not provided, use relevant related industrial keywords instead. DO NOT include "Hirani Marketing Combines" in the title.
2. "description" — meta description, 140–160 characters. EXACT FORMAT: "Leading [Category Name] supplier in Parrys, Chennai offering [Subcategory 1], [Subcategory 2], and [Subcategory 3] with expert sales and support." Adapt this template naturally to fit the character limit and provided subcategories. NO TRANSACTIONAL OR CALL CTAS. Focus purely on professional specifications and category listings. DO NOT explicitly mention the shop name "Hirani Marketing Combines" unless it perfectly fits the limit, prefer just "supplier in Parrys, Chennai".
3. "keywords" — a single comma-separated string of 15-20 high-intent search terms.
4. "teaser" — a concise, engaging description of the category (80-120 chars). This is displayed on the category card and at the top of the category page. Make it a proper, well-written sentence describing what this category includes and its main applications.
5. "footText" — short text appearing at the bottom of the category card. If subcategories are provided, count them and output e.g., "5 types". If not, just say "View types".

Return ONLY the JSON object.`;
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
