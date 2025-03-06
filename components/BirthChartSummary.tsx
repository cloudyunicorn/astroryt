'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Sunrise } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { BirthChartService } from '@/lib/services/birth-chart'
import BirthDataForm from './BirthDataForm'

export interface PlanetaryData {
  name: string
  rasi: number
  nakshatra: number
  longitude?: number
}

export interface IBirthChart {
  planetaryData: PlanetaryData[]
  ascendant?: number
  updatedAt: string
}

interface BirthChartSummaryProps {
  initialChartData: any | null
  userId: string
  hasUserBirthData: boolean
}

/**
 * Helper to convert raw data into our IBirthChart type.
 */
function parseBirthChart(raw: any): IBirthChart | null {
  if (!raw) return null
  return {
    planetaryData: (raw.planetaryData ?? []) as unknown as PlanetaryData[],
    ascendant: raw.ascendant ?? undefined,
    updatedAt:
      raw.updatedAt instanceof Date
        ? raw.updatedAt.toISOString()
        : String(raw.updatedAt),
  }
}

const rasiNames = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
]

function getRasiName(index: number): string {
  return rasiNames[(index - 1) % 12]
}

const nakshatraNames = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashirsha',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
]

function getNakshatraName(index: number): string {
  return nakshatraNames[(index - 1) % 27]
}

export default function BirthChartSummary({
  initialChartData,
  userId,
  hasUserBirthData,
}: BirthChartSummaryProps) {
  const [chart, setChart] = useState<IBirthChart | null>(parseBirthChart(initialChartData))
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateChart = async () => {
    setLoading(true)
    setError(null)
    try {
      // Trigger NASA HORIZONS API call and Vedic processing.
      await BirthChartService.calculateChart(userId)
      const newData = await BirthChartService.getChart(userId)
      setChart(parseBirthChart(newData))
    } catch (err: any) {
      setError(err.message || 'Failed to generate birth chart')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sunrise className="w-6 h-6 text-primary" />
          Your Birth Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : chart ? (
          <>
            <div className="relative w-full h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
              {/* Zodiac Wheel Visualization Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-muted-foreground">Interactive Zodiac Wheel</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {/* {chart.planetaryData.map((planet) => (
                <div key={planet.name} className="flex justify-between">
                  <span className="capitalize">{planet.name}:</span>
                  <span className="font-medium">
                    {`Rasi ${getRasiName(planet.rasi)} | Nakshatra ${getNakshatraName(planet.nakshatra)}`}
                  </span>
                </div>
              ))} */}
              <div className="flex justify-between">
                <span>Ascendant:</span>
                <span className="font-medium">
                  {chart.ascendant ? getRasiName(chart.ascendant) : 'N/A'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground">No birth chart calculated yet.</p>
          </div>
        )}
        {error && <p className="text-destructive mt-2">{error}</p>}
      </CardContent>
      <CardFooter className="flex justify-end">
        {hasUserBirthData ? (
          <Button onClick={handleGenerateChart} disabled={loading}>
            {loading ? 'Generating...' : chart ? 'Regenerate Birth Chart' : 'Calculate Birth Chart'}
          </Button>
        ) : (
          // When no birth data is provided, show a Dialog to enter data.
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                Enter Birth Data
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogTitle>Enter Your Birth Data</DialogTitle>
              <DialogDescription>Please enter your birth details below.</DialogDescription>
              <BirthDataForm userId={userId} />
              <DialogClose asChild>
                <Button variant="ghost" className="mt-2 w-full">Close</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  )
}
