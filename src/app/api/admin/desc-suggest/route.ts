import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Same Gemini setup as /api/chat — swappable via env.
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
  return `You are an expert e-commerce copywriter. Your task is to write a highly professional, accurate, and engaging product description for the following product.
You MUST use the Google Search tool to search the internet for the product's official specifications, features, and marketing points.

Product Details provided by the user:
- Name: ${p.name || '(unnamed)'}
- Brand: ${p.brand || 'unbranded'}
- Category: ${p.category || '-'}
- Subcategory: ${p.subcategory || '-'}
${specLines ? `- Known Specifications:\n${specLines}` : ''}

Instructions:
1. Use your knowledge to gather facts, features, and benefits about "${p.name} ${p.brand}".
2. Write a concise, natural, and highly professional product description (maximum 2 short paragraphs).
3. Focus purely on what the product is, its core design, build materials, and key technical capabilities (like flow rate, head, motor power).
4. DO NOT include an "Applications", "Use Cases", or "Ideal For" section. That information is displayed separately.
5. Keep the tone persuasive but human-readable, tailored for B2B/B2C buyers of pumps and industrial equipment.
6. Return ONLY the final formatted description in Markdown. Do not wrap it in JSON or add any conversational preamble.`;
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
