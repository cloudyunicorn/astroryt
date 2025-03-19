'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface PersonalData {
  zodiac: string;
  planetarySummary: string;
}

interface AIRecommendationsProps {
  personalData: PersonalData;
}

export default function AIRecommendations({ personalData }: AIRecommendationsProps) {
  const [recommendation, setRecommendation] = useState<string>('Fetching AI insights...');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchRecommendation = async () => {
    setLoading(true);
    setError('');
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing Gemini API key");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `You're my personal astrologer. My zodiac sign is ${personalData.zodiac} and my planetary positions are: ${personalData.planetarySummary}. Provide a single-sentence recommendation for my well-being.`;

      const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });

      const aiResponse = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No recommendation available.';
      setRecommendation(aiResponse);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, [personalData]);

  return (
    <Card className="shadow-sm border rounded-lg bg-background">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">
          <Sparkles className="w-5 h-5 text-secondary" />
          AI Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading recommendation...</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{recommendation}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={fetchRecommendation} disabled={loading}>
          Refresh Recommendation
        </Button>
      </CardFooter>
    </Card>
  );
}
