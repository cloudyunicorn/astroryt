import { NextResponse } from 'next/server'
import { 
    toJulian, 
    calculateAyanamsa, 
    toSidereal, 
    getNakshatra, 
    getZodiacSign 
} from '@/lib/astrology-utils'
import { prisma } from "@/db/prisma";

export async function POST(req: Request) {
    const { userId } = await req.json();
    
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { birthChart: true }
        });

        if (!user?.birthChart) {
            return NextResponse.json({ error: 'Birth chart not found' }, { status: 404 });
        }

        // Get NASA data
        const nasaData = await fetchHorizonsData(user.birthChart);
        const jd = toJulian(user.birthChart.birthDate);
        const ayanamsa = calculateAyanamsa(jd);

        // Process planetary data
        const vedicData = nasaData.planets.map((planet: any) => {
            const siderealLon = toSidereal(planet.lon, ayanamsa);
            const { index: nakshatra, pada } = getNakshatra(siderealLon);
            
            return {
                name: planet.name,
                tropical: planet.lon,
                sidereal: siderealLon,
                zodiac: getZodiacSign(siderealLon),
                nakshatra,
                pada
            };
        });

        // Save to database
        await prisma.birthChart.update({
            where: { userId },
            data: {
                rawData: nasaData,
                vedicData: {
                    ayanamsa,
                    planets: vedicData,
                    houses: calculateHouses(jd, user.birthChart.lat, user.birthChart.lon)
                }
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json(
            { error: 'Calculation failed' },
            { status: 500 }
        );
    }
}

async function fetchHorizonsData(chart: { birthDate: Date, lat: number, lon: number }) {
    // NASA API implementation from previous steps
}