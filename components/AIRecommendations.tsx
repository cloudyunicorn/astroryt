'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

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

  const fetchRecommendation = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/gemini-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalData),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendation');
      }

      const data = await response.json();
      setRecommendation(data.recommendation || 'No recommendation available.');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, [personalData]);

  useEffect(() => {
    fetchRecommendation();
  }, [personalData, fetchRecommendation]);

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
