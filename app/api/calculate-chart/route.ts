import { NextResponse } from 'next/server';
import {
  calculateVedicChart,
  calculateLagna,
  getSunZodiacWestern
} from '@/lib/astrology-utils';
import { prisma } from "@/db/prisma";

interface BirthChartRequest {
  userId: string;
}

export async function POST(req: Request) {
  try {
    const { userId } = (await req.json()) as BirthChartRequest;

    // Fetch user data with birth chart
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        birthChart: true
      }
    });

    if (!user?.birthChart || user.birthChart.length === 0) {
      return NextResponse.json(
        { error: 'Birth chart not found' },
        { status: 404 }
      );
    }

    const birthChart = user.birthChart[0];

    // Check if we already have the calculated data
    if (birthChart.vedicData && Object.keys(birthChart.vedicData).length > 0) {
      return NextResponse.json({ data: birthChart.vedicData });
    }
    
    // If rawHorizonsData is empty or null, return an error
    if (!birthChart.rawHorizonsData || Object.keys(birthChart.rawHorizonsData).length === 0) {
      return NextResponse.json(
        { error: 'Raw Horizons data is missing. Please fetch astronomical data first.' },
        { status: 400 }
      );
    }

    const rawData = JSON.stringify(birthChart.rawHorizonsData);

    // Calculate Vedic chart data from raw text
    const planets = calculateVedicChart(rawData);

    // Calculate additional positions
    const sunPosition = planets.find(p => p.name.toLowerCase() === 'sun');
    const moonPosition = planets.find(p => p.name.toLowerCase() === 'moon');

    // Calculate Lagna with proper time handling
    const lagna = calculateLagna(
      new Date(birthChart.birthTime),
      birthChart.lon
    );

    const sunZodiac = sunPosition?.zodiac || getSunZodiacWestern(new Date(birthChart.birthDate));
    const moonNakshatra = moonPosition?.nakshatra || 'Unknown';

    // Prepare response data
    const responseData = {
      planets: planets.map(p => ({
        name: p.name,
        RA: p.RA,
        DEC: p.DEC,
        tropicalLongitude: p.tropicalLongitude,
        siderealLongitude: p.siderealLongitude,
        zodiac: p.zodiac,
        nakshatra: p.nakshatra,
        pada: p.pada,
        constellation: p.constellation
      })),
      lagna,
      sunZodiac,
      moonNakshatra
    };

    // Save the data to the database
    try {
      await prisma.birthChart.update({
        where: { userId },
        data: {
          vedicData: responseData,
          planetaryData: planets.map(p => ({
            name: p.name,
            zodiac: p.zodiac,
            nakshatra: p.nakshatra,
            pada: p.pada
          }))
        }
      });
    } catch (dbError) {
      console.error('Failed to update database but calculation succeeded:', dbError);
      // Continue despite database error - we'll return the calculated data
    }

    return NextResponse.json({ data: responseData });
  } catch (error) {
    console.error('Chart calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate birth chart: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}