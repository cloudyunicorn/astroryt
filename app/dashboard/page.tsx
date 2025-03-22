// app/dashboard/page.tsx
import { auth } from '@/auth';
import { BirthChartService } from '@/lib/services/birth-chart';
import { IBirthChart, PlanetaryData } from '@/lib/types/birth-chart';
import { getUserBirthDate, getUserBirthLocation, getUserBirthTime } from '@/lib/actions/user.action';
import { getSunZodiacWestern } from '@/lib/astrology-utils';
import { formatBirthDate, formatBirthTime } from '@/lib/utils';
import DashboardClient from "@/components/DashboardClient";

interface MySession {
  user: {
    id: string;
    name?: string | null;
  };
}

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user || !session.user.id) return <div>Not authenticated</div>;

  const mySession = session as MySession;

  const userId = mySession.user.id;

  // Fetch the stored BirthChart record from Prisma.
  const chart = await BirthChartService.getChart(userId);

  // If a BirthChart record exists, the user has provided their birth data.
  const hasUserBirthData = Boolean(chart);

  // Parse the fetched chart into our expected type.
  const parsedChart: IBirthChart | null = chart
    ? {
        planetaryData: Array.isArray(chart?.planetaryData)
          ? (chart?.planetaryData as PlanetaryData[])
          : [],
        ascendant: undefined,
        updatedAt: new Date(chart?.updatedAt).toISOString(),
      }
    : null;

  const userBirthLocation = await getUserBirthLocation(userId)
  const userBirthTimeRaw = await getUserBirthTime(userId);
  const userBirthTime = userBirthTimeRaw
    ? formatBirthTime(userBirthTimeRaw)
    : null;

  // Get the user's birth date. If it doesn't exist, provide a fallback.
  const userBirthDateRaw = await getUserBirthDate(userId);
  const westernZodiac = userBirthDateRaw
    ? await getSunZodiacWestern(userBirthDateRaw)
    : 'Birth data not entered';
  const userBirthDate = userBirthDateRaw
    ? formatBirthDate(userBirthDateRaw)
    : null;

  const personalData = {
    zodiac: westernZodiac, // from your birth chart data
    planetarySummary:
      Array.isArray(chart?.planetaryData)
        ? (chart?.planetaryData as PlanetaryData[])
            .map((p) => `${p.name}: ${p.zodiac}`)
            .join(', ')
        : 'No planetary data available',
  };
  // const rawData = await getUserRawHorizonsData(userId)
  // const data1 = processRawHorizonsData(JSON.parse(JSON.stringify(rawData)).Sun.result)
  // const test = equatorialToEcliptic(336, 24.9)
  // const zod = getZodiacSign(349)
  // console.log("TEST",test)
  // console.log(JSON.parse(JSON.stringify(rawData)).Sun.result)
  // console.log(data1)
  // console.log(rawData)

//   function calculateLagna(birthTime: Date, longitude: number, latitude: number): string {
//     const jd = dateToJulianDay(birthTime);
    
//     // Calculate Local Sidereal Time (LST)
//     const T = (jd - 2451545.0) / 36525;
//     const GMST = 280.46061837 + 360.98564736629 * (jd - 2451545) 
//                 + 0.000387933 * T * T - T * T * T / 38710000;
//     const LST = (GMST + longitude) % 360;
    
//     // Calculate Obliquity of the Ecliptic
//     const epsilon = 23.4392911 - 0.0130042 * T - 0.00000164 * T * T + 0.000000503 * T * T * T;
    
//     // Convert LST to Right Ascension of the Ascendant
//     const LST_rad = (LST * Math.PI) / 180;
//     const lat_rad = (latitude * Math.PI) / 180;
//     const epsilon_rad = (epsilon * Math.PI) / 180;
    
//     const RA = Math.atan2(
//       Math.sin(LST_rad),
//       Math.cos(LST_rad) * Math.cos(epsilon_rad) + 
//       Math.tan(lat_rad) * Math.sin(epsilon_rad)
//     );
    
//     // Convert RA to Ecliptic Longitude
//     const lambda = Math.atan2(
//       Math.sin(RA) * Math.cos(epsilon_rad),
//       Math.cos(RA)
//     );
    
//     // Convert to degrees and normalize
//     let ascendantLongitude = (lambda * 180) / Math.PI;
//     if (ascendantLongitude < 0) ascendantLongitude += 360;
    
//     // Get zodiac sign from longitude
//     return getZodiacSign(ascendantLongitude);
//   }

//   function getZodiacSign(longitude: number): string {
//   const signs = [
//     'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
//     'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
//   ];
//   const index = Math.floor(longitude / 30) % 12;
//   return signs[index];
// }

// function dateToJulianDay(date: Date): number {
//   const year = date.getUTCFullYear();
//   const month = date.getUTCMonth() + 1; // JS months are 0-indexed
//   const day = date.getUTCDate();
//   const A = Math.floor((14 - month) / 12);
//   const Y = year + 4800 - A;
//   const M = month + 12 * A - 3;
//   const JDN = day + Math.floor((153 * M + 2) / 5) + 365 * Y +
//     Math.floor(Y / 4) - Math.floor(Y / 100) + Math.floor(Y / 400) - 32045;
//   const hour = date.getUTCHours();
//   const minute = date.getUTCMinutes();
//   const second = date.getUTCSeconds();
//   const fraction = (hour - 12) / 24 + minute / 1440 + second / 86400;
//   return JDN + fraction;
// }

// const birthTime = new Date('1995-10-30T13:40:00Z');
// console.log(calculateLagna(birthTime, 77.2, 28.6));

  return (
    <DashboardClient
      session={mySession}
      personalData={personalData}
      hasUserBirthData={hasUserBirthData}
      userBirthDate={userBirthDate}
      userBirthTime={userBirthTime}
      userBirthLocation={userBirthLocation}
      userId={userId}
      parsedChart={parsedChart} // ✅ Pass parsedChart
      westernZodiac={westernZodiac}
    />
  );
}
