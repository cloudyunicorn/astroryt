// app/api/calculate-chart/route.ts
import { NextResponse } from 'next/server'; 
import {
  calculateVedicChart,
  calculateLagna,
  getSunZodiacWestern,
  VedicPlanet,
  processRawHorizonsData,
  PlanetData,
  HorizonsData,
} from '@/lib/astrology-utils';
import { prisma } from '@/db/prisma';
import { Prisma } from '@prisma/client';

interface BirthChartRequest {
  userId: string;
}

export async function POST(req: Request) {
  try {
    const { userId } = (await req.json()) as BirthChartRequest;
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Fetch user data with birth chart (birthChart is an array)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { birthChart: true },
    });
    if (!user?.birthChart || user.birthChart.length === 0) {
      return NextResponse.json({ error: 'Birth chart not found' }, { status: 404 });
    }
    const birthChart = user.birthChart[0];

    // Return pre-calculated data if it exists.
    if (birthChart.vedicData && Object.keys(birthChart.vedicData).length > 0) {
      return NextResponse.json({ data: birthChart.vedicData });
    }
    if (!birthChart.rawHorizonsData || Object.keys(birthChart.rawHorizonsData).length === 0) {
      return NextResponse.json(
        { error: 'Raw Horizons data is missing. Please fetch astronomical data first.' },
        { status: 400 }
      );
    }

    // Process rawHorizonsData which is a JSON object keyed by planet names.
    let combinedPlanets: PlanetData[] = [];
    let horizonsDataJD: number | null = null;
    const storedRaw = birthChart.rawHorizonsData;
    if (typeof storedRaw === 'object' && storedRaw !== null && !Array.isArray(storedRaw)) {
      for (const planetKey in storedRaw) {
        const planetVal = storedRaw[planetKey];
        let rawText = '';
        if (typeof planetVal === 'object' && planetVal !== null && 'result' in planetVal && typeof planetVal.result === 'string') {
          rawText = planetVal.result;
        } else if (typeof planetVal === 'string') {
          rawText = planetVal;
        }
        try {
          // Process each raw text block to extract HorizonsData.
          const hd: HorizonsData = processRawHorizonsData(rawText);
          if (!horizonsDataJD) {
            horizonsDataJD = hd.jd;
          }
          // Append the first planet data from this block (or modify to merge all if needed)
          if (hd.planets.length > 0) {
            combinedPlanets.push(hd.planets[0]);
          }
        } catch (e) {
          console.error(`Error processing data for ${planetKey}:`, e);
        }
      }
    } else if (typeof storedRaw === 'string') {
      // If storedRaw is a string, process it once.
      const hd: HorizonsData = processRawHorizonsData(storedRaw);
      horizonsDataJD = hd.jd;
      combinedPlanets = hd.planets;
    } else {
      return NextResponse.json(
        { error: 'Invalid format for rawHorizonsData' },
        { status: 500 }
      );
    }

    if (!horizonsDataJD) {
      return NextResponse.json({ error: 'Unable to extract JD from raw data' }, { status: 500 });
    }

    // Calculate Vedic chart data from the combined PlanetData array.
    // Here, calculateVedicChart is updated to accept HorizonsData.
    const vedicPlanets: VedicPlanet[] = calculateVedicChart(birthChart.birthTime, { jd: horizonsDataJD, planets: combinedPlanets });

    // Calculate additional chart elements.
    const lagna = calculateLagna(new Date(birthChart.birthTime), birthChart.lon, birthChart.lat);
    const sunPosition = vedicPlanets.find((p: VedicPlanet) => p.name.toLowerCase() === 'sun');
    const moonPosition = vedicPlanets.find((p: VedicPlanet) => p.name.toLowerCase() === 'moon');
    const sunZodiac = sunPosition?.zodiac || getSunZodiacWestern(new Date(birthChart.birthDate));
    const moonNakshatra = moonPosition?.nakshatra || 'Unknown';

    // Prepare response data.
    const responseData = {
      planets: vedicPlanets.map((p: VedicPlanet) => ({
        name: p.name,
        RA: p.RA,
        DEC: p.DEC,
        tropicalLongitude: p.tropicalLongitude,
        siderealLongitude: p.siderealLongitude,
        zodiac: p.zodiac,
        nakshatra: p.nakshatra,
        pada: p.pada,
        constellation: p.constellation,
      })),
      lagna,
      sunZodiac,
      moonNakshatra,
    };

    // Update the database with the calculated Vedic chart.
    await prisma.birthChart.update({
      where: { userId },
      data: {
        vedicData: JSON.parse(JSON.stringify(responseData)) as Prisma.InputJsonValue,
        planetaryData: JSON.parse(JSON.stringify(
          vedicPlanets.map((p: VedicPlanet) => ({
            name: p.name,
            zodiac: p.zodiac,
            nakshatra: p.nakshatra,
            pada: p.pada,
          }))
        )) as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ data: responseData });
  } catch (error: unknown) {
    console.error('Chart calculation error:', error);
    let errMsg = 'Failed to calculate birth chart';
    if (error instanceof Error) errMsg = error.message;
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
