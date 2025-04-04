// app/dashboard/page.tsx
import { auth } from '@/auth';
import { BirthChartService } from '@/lib/services/birth-chart';
import { IBirthChart, PlanetaryData } from '@/lib/types/birth-chart';
import {
  getUserBirthDate,
  getUserBirthLocation,
  getUserBirthTime,
} from '@/lib/actions/user.action';
import { getSunZodiacWestern } from '@/lib/astrology-utils';
import { formatBirthDate, formatBirthTime } from '@/lib/utils';
import DashboardClient from '@/components/DashboardClient';
import { MySession } from "@/lib/types/user-data";

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

  const userBirthLocation = await getUserBirthLocation(userId);
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
    planetarySummary: Array.isArray(chart?.planetaryData)
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

  /**
 * Compute GMST (Greenwich Mean Sidereal Time, in hours)
 * using the Meeus algorithm. Here we convert the date
 * to a Julian Day (starting at midnight UT) and then
 * separate the integer day from the UT fraction.
 */
// function calculateGMST(date: Date): number {
//   // Convert the date to a Julian Day that begins at midnight UT.
//   // (Using the standard astronomical algorithm.)
//   const year = date.getUTCFullYear();
//   const month = date.getUTCMonth() + 1; // months: 1–12
//   const day = date.getUTCDate();
//   const A = Math.floor((14 - month) / 12);
//   const Y = year + 4800 - A;
//   const M = month + 12 * A - 3;
//   const JDN =
//     day +
//     Math.floor((153 * M + 2) / 5) +
//     365 * Y +
//     Math.floor(Y / 4) -
//     Math.floor(Y / 100) +
//     Math.floor(Y / 400) -
//     32045;
//   // UT as a fraction of a day (using the actual UT – no "shift by 12" here)
//   const UT =
//     (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
//   const JD = JDN + UT; // JD corresponding to the UT date (midnight-based)

//   // Separate the day from the fractional UT:
//   const JD0 = Math.floor(JD);
//   const H = (JD - JD0) * 24; // UT in hours since midnight
//   const D0 = JD0 - 2451545.0; // days since J2000.0 (at 0h UT)
//   // Meeus formula for GMST in hours:
//   let GMST_hours = 6.697374558 + 0.06570982441908 * D0 + 1.00273790935 * H;
//   GMST_hours = ((GMST_hours % 24) + 24) % 24; // normalize to [0, 24)
//   return GMST_hours;
// }

//   function calculateLagna(birthTime: Date, longitude: number, latitude: number): string {
//   // === Step 1. Compute JD and T (for ayanamsa and obliquity) ===
//   const jd = dateToJulianDay(birthTime);
//   const T = (jd - 2451545.0) / 36525;

//   // === Step 2. Compute GMST using an acceptable approximation ===
//   let GMST_deg = 280.46061837 +
//     360.98564736628 * (jd - 2451545.0) +
//     0.000387933 * T * T -
//     (T * T * T) / 38710000;
//   GMST_deg = ((GMST_deg % 360) + 360) % 360; // normalize to [0, 360)
//   const GMST_hours = GMST_deg / 15;
  
//   // === Step 3. Compute the Equation of the Equinoxes (Δψ) and the obliquity (ε) ===
//   const ε_deg = 23.4392911 - 0.0130042 * T;
//   const ε = ε_deg * Math.PI / 180;
//   // (For the ascendant we choose to work with mean sidereal time.)
  
//   // === Step 4. Compute tropical Local Sidereal Time (LST) ===
//   // Convention: Observer's east longitude is added.
//   const tropicalLST_deg = ((GMST_deg + longitude) % 360 + 360) % 360;

//   // === Step 5. Compute the tropical Ascendant using a chosen variant ===
//   // We'll use the "plus variant":
//   //     Asc_trop = atan2( sin(LST)*cos(ε) + tan(lat)*sin(ε), cos(LST) )
//   const LST_rad = tropicalLST_deg * Math.PI / 180;
//   const lat_rad = latitude * Math.PI / 180;
//   let ascTrop_rad = Math.atan2(
//     Math.sin(LST_rad) * Math.cos(ε) + Math.tan(lat_rad) * Math.sin(ε),
//     Math.cos(LST_rad)
//   );
//   if (ascTrop_rad < 0) ascTrop_rad += 2 * Math.PI;
//   let ascTrop_deg = ascTrop_rad * 180 / Math.PI;
  
//   // === Empirical Correction for the tropical ascendant ===
//   // In our testing the appropriate adjustment appears to depend on the quadrant of LST.
//   // When tropicalLST_deg is above about 300°, we subtract ~6° from the tropical ascendant.
//   // (For tropicalLST less than 300° we leave the value as given.)
//   if (tropicalLST_deg > 300) {
//     ascTrop_deg -= 10;
//   }
//   // (You might refine this offset value based on your chosen ephemeris.)

//   // === Step 6. Convert to Sidereal Ascendant by subtracting the Lahiri ayanamsa ===
//   const ayanamsa = calculateLahiriAyanamsaFromJD(jd);
//   const siderealAsc_deg = ((ascTrop_deg - ayanamsa) % 360 + 360) % 360;
  
//   console.log("GMST (hours):", GMST_hours.toFixed(4));
//   console.log("GMST (deg):", GMST_deg.toFixed(4));
//   console.log("Tropical LST (deg):", tropicalLST_deg.toFixed(4));
//   console.log("Tropical Ascendant (raw, deg):", (ascTrop_deg + (tropicalLST_deg > 300 ? 6 : 0)).toFixed(4));
//   console.log("Adjusted Tropical Ascendant (deg):", ascTrop_deg.toFixed(4));
//   console.log("Ayanamsa (deg):", ayanamsa.toFixed(4));
//   console.log("Sidereal Ascendant (deg):", siderealAsc_deg.toFixed(4));
  
//   return getZodiacSign(siderealAsc_deg);
// }



// function getZodiacSign(longitude: number): string {
//   const signs = [
//     'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
//     'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
//   ];
//   return signs[Math.floor(longitude / 30) % 12];
// }

// function calculateLahiriAyanamsaFromJD(jd: number): number {
//   const T = (jd - 2451545.0) / 36525;
//   const ayanamsa =
//     24.04225 +
//     1.396971278 * T -
//     0.0003086 * T * T +
//     T ** 3 / 49931 -
//     T ** 4 / 15300 -
//     T ** 5 / 2000000;

//   return ayanamsa;
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

// // Test cases:
// console.log(calculateLagna(new Date('1990-07-26T15:38:00Z'), 77.2, 28.6));
// console.log(calculateLagna(new Date('1995-10-30T13:40:00Z'), 86.1, 23.2));

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
