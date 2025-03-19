import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { zodiac, planetarySummary } = await req.json();

    if (!zodiac || !planetarySummary) {
      return NextResponse.json({ error: 'Missing personal data' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You're my personal astrologer. My zodiac sign is ${zodiac} and my planetary positions are: ${planetarySummary}. Provide a single-sentence recommendation for my well-being.`;

    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });

    const recommendation =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No recommendation available.';

    return NextResponse.json({ recommendation });
  } catch {
    return NextResponse.json({ error: 'Failed to generate recommendation' }, { status: 500 });
  }
}
