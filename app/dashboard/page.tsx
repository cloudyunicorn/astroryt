// app/dashboard/page.tsx
import { auth } from '@/auth';
import { BirthChartService } from '@/lib/services/birth-chart';
import { IBirthChart, PlanetaryData } from '@/lib/types/birth-chart';
// import DailyHoroscope from '@/components/DailyHoroscope';
// import WeeklyHoroscope from '@/components/WeeklyHoroscope';
import { getUserBirthDate, getUserBirthTime } from '@/lib/actions/user.action';
import { getSunZodiacWestern } from '@/lib/astrology-utils';
import { formatBirthDate, formatBirthTime } from '@/lib/utils';
import DashboardClient from "@/components/DashboardClient";

interface MySession {
  user: {
    id: string;
    name?: string | null;
    // add more fields as needed
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
        planetaryData: Array.isArray(chart.planetaryData)
          ? (chart.planetaryData as PlanetaryData[])
          : [],
        ascendant: undefined,
        updatedAt: new Date(chart.updatedAt).toISOString(),
      }
    : null;

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
      Array.isArray(chart.planetaryData)
        ? (chart.planetaryData as PlanetaryData[])
            .map((p) => `${p.name}: ${p.zodiac}`)
            .join(', ')
        : 'No planetary data available',
  };

  return (
    <DashboardClient
      session={mySession}
      personalData={personalData}
      hasUserBirthData={hasUserBirthData}
      userBirthDate={userBirthDate}
      userBirthTime={userBirthTime}
      userId={userId}
      parsedChart={parsedChart} // ✅ Pass parsedChart
      westernZodiac={westernZodiac}
    />
  );
}
