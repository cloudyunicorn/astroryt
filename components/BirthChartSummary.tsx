'use client';

import { useEffect, useState } from 'react';
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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { BirthChartService } from '@/lib/services/birth-chart';
import BirthDataForm from './BirthDataForm';

export interface PlanetaryData {
  name: string;
  zodiac: string;
  nakshatra: number;
  pada: number;
}

export interface IBirthChart {
  planetaryData: PlanetaryData[];
  ascendant?: number;
  updatedAt: string;
}

interface BirthChartSummaryProps {
  initialChartData: IBirthChart | null;
  userId: string;
  hasUserBirthData: boolean;
  vedicData: unknown;
}

interface StoredVedicData {
  lagna: string;
  planets: PlanetaryData[];
  sunZodiac: string;
  moonNakshatra: string;
}

interface VedicPlanet {
  name: string;
  RA: number;
  DEC: number;
  tropicalLongitude: number;
  siderealLongitude: number;
  zodiac: string;
  nakshatra: string;
  pada: number;
  constellation: string;
}

interface VedicChart {
  planets: VedicPlanet[];
  lagna: string;
  sunZodiac: string;
  moonNakshatra: string;
}

/**
 * Helper to convert raw data into our IBirthChart type.
 */
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
  vedicData,
}: BirthChartSummaryProps) {
  const [chart, setChart] = useState<IBirthChart | null>(
    parseBirthChart(initialChartData)
  );
  const [chartV, setChartV] = useState<VedicChart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(false); // Add reload trigger

  const handleGenerateChart = async () => {
    setLoading(true);
    setError(null);
    try {
      // Trigger NASA HORIZONS API call and Vedic processing.
      await BirthChartService.calculateChart(userId);
      const newData = await BirthChartService.getChart(userId);
      setChart(parseBirthChart(newData));

      await fetchVedicChart();
      setReloadFlag((prev) => !prev);
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

  // Add useEffect to handle final reload
  useEffect(() => {
    if (reloadFlag) {
      // Any final cleanup or state updates after reload
      setReloadFlag(false);
    }
  }, [reloadFlag]);

  const storedData = hasUserBirthData ? (vedicData as StoredVedicData) : null;
  const vedicLagna = hasUserBirthData ? storedData?.lagna : null;

  const fetchVedicChart = async () => {
    try {
      const res = await fetch('/api/calculate-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const { data } = (await res.json()) as { data: VedicChart };
      setChartV(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
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
            <div className="mt-4 space-y-2">
              {/* Planetary Data Section */}
              <div className="p-3 bg-muted/10 rounded-md">
                <h3 className="text-md font-medium text-muted-foreground mb-3">
                  Planetary Positions
                </h3>
                <ul className="space-y-2">
                  {chart.planetaryData.map((planet) => (
                    <li
                      key={planet.name}
                      className="flex items-center justify-between p-2 bg-secondary/10 rounded"
                    >
                      <span className="capitalize font-medium text-sm">
                        {planet.name}
                      </span>
                      <span className="text-sm text-foreground/80">
                        {planet.zodiac}{' '}
                        <span className="text-xs text-foreground/60">
                          (Nakshatra {planet.nakshatra}, Pada {planet.pada})
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ascendant Section */}
              <div className="p-3 bg-muted/10 rounded-md">
                <h3 className="text-md font-medium text-muted-foreground mb-2">
                  Ascendant
                </h3>
                <div className="flex items-center justify-between px-2 py-1 bg-secondary/10 rounded">
                  <span className="text-sm text-foreground/70">Ascendant:</span>
                  <span className="text-sm font-semibold">
                    {vedicLagna || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          // When no birth data is available, show the Enter Birth Data button centered.
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-sm text-muted-foreground mb-4">
              No birth chart calculated yet.
            </p>
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
              ? 'Regenerate Birth Chart'
              : 'Calculate Birth Chart'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
