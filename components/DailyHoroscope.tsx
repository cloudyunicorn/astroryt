'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";

interface DailyHoroscopeProps {
  zodiacSign: string;
}

export default function DailyHoroscope({ zodiacSign }: DailyHoroscopeProps) {
  const [horoscope, setHoroscope] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);

  const handleGenerateHoroscope = async () => {
    setLoading(true);
    setError('');
    try {
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Please provide today's(${currentDate}) horoscope for ${zodiacSign}. Text should be Ideal for showing in web browsers to customers in a website, use emoticons to beautify the text, Write the response in a beautifully written, poetic, and friendly tone, remove any disclaimers or warnings.`
                }
              ]
            }
          ]
        })
      });
      if (!response.ok) {
        throw new Error("Failed to fetch horoscope");
      }
      const data = await response.json();
      const message = data?.choices[0]?.message?.content;
      setHoroscope(message || "No horoscope available for today.");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card className="shadow-sm border rounded-lg bg-background">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">
          Today&apos;s Horoscope
        </CardTitle>
      </CardHeader>
      <CardContent>
        {horoscope ? (
          <>
            {loading ? (
              <Skeleton className="h-32 w-full rounded-md" />
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : (
              <p className="text-sm text-muted-foreground line-clamp-6">
                {horoscope}
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-32">
            <p className="text-sm text-muted-foreground mb-4">
              Click below to generate your daily horoscope
            </p>
            <Button onClick={handleGenerateHoroscope} size="sm">
              Generate Horoscope
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {horoscope && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Read More
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[400px] overflow-y-auto">
              <DialogTitle>Today&apos;s Horoscope for {zodiacSign}</DialogTitle>
              <DialogDescription className="whitespace-pre-wrap">
                {horoscope}
              </DialogDescription>
              <DialogClose asChild>
                <Button variant="ghost" className="mt-2 w-full">
                  Close
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}
