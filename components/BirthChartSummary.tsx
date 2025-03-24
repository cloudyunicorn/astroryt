'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sunrise } from 'lucide-react';
import { BirthChartService } from '@/lib/services/birth-chart';
import BirthDataDisplay from './BirthDataDisplay';
import PlanetaryPositions from './PlanetaryPositions';
import ReloadButton from './ReloadButton';
import { PlanetaryData, VedicChart } from '@/lib/types/birth-chart';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import BirthDataForm from './BirthDataForm';

export interface IBirthChart {
  planetaryData: {
    name: string;
    zodiac: string;
    nakshatra: number;
    pada: number;
  }[];
  ascendant?: number;
  updatedAt: string;
}

interface BirthChartSummaryProps {
  initialChartData: IBirthChart | null;
  userId: string;
  hasUserBirthData: boolean;
  westernZodiac: string;
  userBirthDate?: string | null;
  userBirthTime?: string | null;
  userBirthLocation?: string | null | undefined;
}

function parseBirthChart(raw: unknown): IBirthChart | null {
  if (!raw || typeof raw !== 'object' || raw === null) return null;
  const data = raw as Record<string, unknown>;

  return {
    planetaryData: Array.isArray(data.planetaryData)
      ? (data.planetaryData as PlanetaryData[])
      : [],
    ascendant: typeof data.ascendant === 'number' ? data.ascendant : undefined,
    updatedAt:
      data.updatedAt instanceof Date
        ? data.updatedAt.toISOString()
        : String(data.updatedAt),
  };
}

export default function BirthChartSummary({
  initialChartData,
  userId,
  hasUserBirthData,
  userBirthDate,
  userBirthTime,
  userBirthLocation,
  westernZodiac,
}: BirthChartSummaryProps) {
  const [chart, setChart] = useState<IBirthChart | null>(
    parseBirthChart(initialChartData)
  );
  const [chartV, setChartV] = useState<VedicChart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const hasFetchedRef = useRef(false);

  const fetchAllChartData = useCallback(async () => {
    try {
      // Fetch both data sources in parallel
      const [natalData, vedicData] = await Promise.all([
        BirthChartService.getChart(userId),
        fetch('/api/calculate-chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }).then((res) => res.json()),
      ]);

      setChart(parseBirthChart(natalData));
      setChartV(vedicData.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load chart data');
      }
    }
  }, [userId]);

  useEffect(() => {
    if (hasUserBirthData && !hasFetchedRef.current) {
      fetchAllChartData();
      hasFetchedRef.current = true;
    }
  }, [hasUserBirthData, fetchAllChartData]);

  const handleGenerateChart = async () => {
    setLoading(true);
    setError(null);
    try {
      // Clear existing data
      setChart(null);
      setChartV(null);

      // Trigger new calculations
      await BirthChartService.calculateChart(userId);

      // Refresh both data sources
      await fetchAllChartData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="md:col-span-2 shadow-sm border border-border/20 rounded-lg bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Sunrise className="w-5 h-5 text-primary" />
          Your Birth Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : hasUserBirthData && chart ? (
          <>
            <BirthDataDisplay
              vedicZodiacSign={chart.planetaryData[0]?.zodiac || 'Unknown'}
              westernZodiac={westernZodiac}
              birthDate={userBirthDate}
              birthTime={userBirthTime}
              birthLocation={userBirthLocation}
            />
            {chartV && (
              <div className="flex items-center justify-between px-2 py-1 bg-secondary/10 rounded">
                <h3 className="text-lg font-semibold text-primary">Lagna</h3>
                <p className="text-sm">{chartV.lagna}</p>
              </div>
            )}
            <div className="mt-4 flex justify-center">
              <PlanetaryPositions planetaryData={chart.planetaryData} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-sm text-muted-foreground mb-4">
              {hasUserBirthData
                ? 'Calculating your birth chart...'
                : 'No birth chart calculated yet.'}
            </p>
            {!hasUserBirthData && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-4">
                    Enter Birth Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogTitle>Enter Your Birth Data</DialogTitle>
                  <DialogDescription>
                    Please enter your birth details below.
                  </DialogDescription>
                  <BirthDataForm userId={userId} />
                  <DialogClose asChild>
                    <Button variant="ghost" className="mt-2 w-full">
                      Close
                    </Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
      </CardContent>
      {hasUserBirthData && (
        <CardFooter className="flex justify-end">
          <Button onClick={handleGenerateChart} disabled={loading}>
            {loading
              ? 'Generating...'
              : chart
              ? 'Generate Birth Chart'
              : 'Calculate Birth Chart'}
          </Button>
          <ReloadButton onReload={() => window.location.reload()} />
        </CardFooter>
      )}
    </Card>
  );
}
