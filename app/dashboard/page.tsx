// app/dashboard/page.tsx
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { auth } from '@/auth';
import Link from 'next/link';
import {
  Bot,
  CalendarDays,
  Star,
  Settings,
  Sparkles,
} from 'lucide-react';
import { BirthChartService } from '@/lib/services/birth-chart';
import BirthChartSummary from '@/components/BirthChartSummary';
import { IBirthChart, PlanetaryData } from '@/lib/types/birth-chart';
import DailyHoroscope from '@/components/DailyHoroscope';
import WeeklyHoroscope from '@/components/WeeklyHoroscope';
import { getUserBirthDate } from "@/lib/actions/user.action";
import { getSunZodiacWestern } from "@/lib/astrology-utils";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user || !session.user.id) return <div>Not authenticated</div>;

  const userId = session.user.id;

  // Fetch the stored BirthChart record from Prisma.
  const chart = await BirthChartService.getChart(userId);

  // If a BirthChart record exists, the user has provided their birth data.
  const hasUserBirthData = Boolean(chart);

  // Parse the fetched chart into our expected type.
  const parsedChart: IBirthChart | null = chart
    ? {
        planetaryData: (chart.planetaryData ?? []) as unknown as PlanetaryData[],
        // Since ascendant is not stored, we set it to undefined.
        ascendant: undefined,
        updatedAt: new Date(chart.updatedAt).toISOString(),
      }
    : null;
  
  // Get the user's birth date. If it doesn't exist, provide a fallback.
  const userBirthDate = await getUserBirthDate(userId);
  const westernZodiac = userBirthDate
    ? await getSunZodiacWestern(userBirthDate)
    : "Birth data not entered";

  return (
    <div className="min-h-screen p-6 space-y-8 bg-muted/40">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Welcome back, {session.user.name?.split(' ')[0] || 'Stellar Seeker'}!
          </h1>
          <p className="text-muted-foreground">
            {westernZodiac !== "Birth data not entered"
              ? `Your Sun sign is ${westernZodiac}`
              : "Please enter your birth data to calculate your horoscope."}
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/settings">
              <Settings className="w-4 h-4 mr-2" />
              Profile Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Birth Chart Summary Card */}
        <BirthChartSummary
          initialChartData={parsedChart}
          userId={userId}
          hasUserBirthData={hasUserBirthData}
        />

        {/* Daily Guidance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6 text-accent" />
              Horoscopes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DailyHoroscope zodiacSign={westernZodiac} />
            <WeeklyHoroscope zodiacSign={westernZodiac} />
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/horoscopes">
                View more horoscopes
                <CalendarDays className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* AI Astrologer Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-secondary" />
              AI Astrologer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Recent conversations:</p>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm truncate">
                  What does Mercury retrograde mean for me...
                </p>
              </div>
            </div>
            <Progress value={65} className="h-2" />
            <p className="text-sm text-muted-foreground">65% of monthly queries remaining</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/chat">
                <Sparkles className="w-4 h-4 mr-2" />
                New Conversation
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Cosmic Calendar */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-primary" />
              Cosmic Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-medium">Next Event:</p>
                <p className="text-primary">Full Moon in Leo</p>
                <p className="text-sm text-muted-foreground">August 19, 2024</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Upcoming:</p>
                <ul className="space-y-2">
                  <li className="text-sm">• Mercury Retrograde (Sep 5)</li>
                  <li className="text-sm">• Autumn Equinox (Sep 22)</li>
                  <li className="text-sm">• Venus enters Scorpio (Oct 3)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personalized Recommendations */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-secondary" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/10">
              <p className="text-sm font-medium">Based on your chart:</p>
              <p className="text-sm">
                Focus on improving communication skills this month
              </p>
            </div>
            <div className="p-4 rounded-lg bg-accent/10">
              <p className="text-sm font-medium">Relationship Insight:</p>
              <p className="text-sm">Best matches: Gemini and Libra signs</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/reports">Generate New Report</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/compatibility">Check Compatibility</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/learn">Astrology Courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
