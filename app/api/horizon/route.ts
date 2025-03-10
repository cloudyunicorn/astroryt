// app/api/horizon/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { Prisma } from '@prisma/client';

// GET: Retrieve the stored birth chart data for the given userId.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Fetch the stored BirthChart record
    const chart = await prisma.birthChart.findUnique({
      where: { userId },
      select: {
        planetaryData: true,
        updatedAt: true,
        // Optionally, you could also select other fields if needed
      },
    });

    if (!chart) {
      return NextResponse.json({ error: 'No chart found' }, { status: 404 });
    }

    return NextResponse.json(chart);
  } catch (error) {
    console.error('Error in GET /api/horizon:', error);
    return NextResponse.json(
      { error: 'Server error retrieving chart' },
      { status: 500 }
    );
  }
}

// POST: Calculate the chart using the stored birth data and update the record.
interface PlanetFetch {
  name: string;
  command: string;
}

interface CombinedRawData {
  [key: string]: unknown;
}

// Define the planets you need to fetch. Adjust COMMAND values as required.
const planetsToFetch: PlanetFetch[] = [
  { name: 'Sun', command: '10' },
  { name: 'Moon', command: '301' },
  { name: 'Mercury', command: '199' },
  { name: 'Venus', command: '299' },
  { name: 'Mars', command: '499' },
  { name: 'Jupiter', command: '599' },
  { name: 'Saturn', command: '699' },
  // For Rahu/Ketu, you typically calculate these from the Moon's position.
];

// Helper delay function (in milliseconds)
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Get birthChart to obtain time, location, etc.
    const birthChart = await prisma.birthChart.findUnique({
      where: { userId },
      select: { birthDate: true, birthTime: true, lat: true, lon: true },
    });
    if (!birthChart) {
      return NextResponse.json(
        { error: 'No birth data available' },
        { status: 404 }
      );
    }

    // Build start/stop times based on birth data.
    const datePart = birthChart.birthDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const timePart = birthChart.birthTime
      .toISOString()
      .split('T')[1]
      .split('.')[0];
    const startTime = `${datePart}T${timePart}`;
    // For stopTime, add one minute.
    const birthTimePlusOne = new Date(birthChart.birthTime);
    birthTimePlusOne.setMinutes(birthTimePlusOne.getMinutes() + 1);
    const stopTime = `${datePart}T${
      birthTimePlusOne.toISOString().split('T')[1].split('.')[0]
    }`;

    console.log('Start time:', startTime, 'Stop time:', stopTime);

    // Sequentially fetch Horizons data for each planet with delay.
    const fetchedPlanets: Array<{ name: string; rawData: unknown }> = [];
    for (const planet of planetsToFetch) {
      // Wait 1 second between requests (adjust as needed)
      await delay(1000);
      const url = `https://ssd.jpl.nasa.gov/api/horizons.api?format=json
  &COMMAND='${planet.command}'
  &OBJ_DATA=YES
  &MAKE_EPHEM=YES
  &EPHEM_TYPE=OBSERVER
  &CENTER=coord
  &START_TIME='${encodeURIComponent(startTime)}'
  &STOP_TIME='${encodeURIComponent(stopTime)}'
  &STEP_SIZE='1%20m'
  &QUANTITIES='1,9'
  &SITE_COORD='${encodeURIComponent(`1,${birthChart.lon},${birthChart.lat},0`)}'
  &CAL_FORMAT=JD
  &CSV_FORMAT=NO`;
      console.log(`Fetching ${planet.name} from:`, url);
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Error fetching ${planet.name}:`, await res.text());
        // Optionally, you could continue to the next planet or throw an error.
        throw new Error(`Horizons API error for ${planet.name}`);
      }
      const data = await res.json();
      fetchedPlanets.push({ name: planet.name, rawData: data });
    }

    // Combine the fetched data into an object keyed by planet name.
    const combinedData: CombinedRawData = {};
    for (const planet of fetchedPlanets) {
      combinedData[planet.name] = planet.rawData;
    }

    // Update the database with the combined raw data.
    const jsonCombinedData = JSON.parse(
      JSON.stringify(combinedData)
    ) as Prisma.InputJsonValue;
    await prisma.birthChart.update({
      where: { userId },
      data: { rawHorizonsData: jsonCombinedData },
    });

    return NextResponse.json({
      message: 'NASA Horizons data fetched and stored successfully',
      data: combinedData,
    });
  } catch (error: unknown) {
    console.error('Error in POST /api/horizon:', error);
    let errMsg = 'Calculation failed due to server error';
    if (error instanceof Error) errMsg = error.message;
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
