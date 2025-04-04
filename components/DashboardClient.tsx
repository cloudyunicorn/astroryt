"use client";

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import Link from 'next/link';
import { Bot, CalendarDays, Star, Settings } from 'lucide-react';
import BirthChartSummary from '@/components/BirthChartSummary';
import AIChatDialog from "@/components/AIChatDialog";
import { useChat } from "@/context/ChatContext";
import { useEffect } from 'react';
import { IBirthChart } from '@/lib/types/birth-chart';
import AIRecommendations from "./AIRecommendations";
import DailyHoroscope from "./DailyHoroscope";
import WeeklyHoroscope from "./WeeklyHoroscope";

interface Session {
  user: {
    id?: string;
    name?: string | null;
  };
}

interface PersonalData {
  zodiac: string;
  planetarySummary: string;
}

export default function DashboardClient({
  session,
  personalData,
  hasUserBirthData,
  userBirthDate,
  userBirthTime,
  userBirthLocation,
  userId,
  parsedChart,
  westernZodiac
}: {
  session: Session;
  personalData: PersonalData;
  hasUserBirthData: boolean;
  userBirthDate: string | null;
  userBirthTime: string | null;
  userBirthLocation: string | null | undefined;
  userId: string;
  parsedChart: IBirthChart | null;
  westernZodiac: string
}) {
  const { setPersonalData } = useChat();

  useEffect(() => {
    setPersonalData(personalData);
  }, [personalData, setPersonalData]);

  return (
    <div className="min-h-screen p-6 space-y-8 bg-muted/40">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Welcome back, {session.user.name?.split(' ')[0] || 'Stellar Seeker'}!
          </h1>
          <p className="text-muted-foreground">
            {personalData.zodiac !== 'Birth data not entered'
              ? `Your Sun sign is ${personalData.zodiac}`
              : 'Please enter your birth data to calculate your horoscope.'}
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/profile-settings">
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
          initialChartData={parsedChart} // ✅ Use parsedChart here
          userId={userId}
          hasUserBirthData={hasUserBirthData}
          userBirthDate={userBirthDate}
          userBirthTime={userBirthTime}
          userBirthLocation={userBirthLocation}
          westernZodiac={personalData.zodiac}
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
            <AIChatDialog personalData={personalData} />
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/chat">Go to Full Chat</Link>
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
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="md:col-span-2">
          <CardHeader>
          </CardHeader>
          <CardContent className="space-y-4">
            <AIRecommendations personalData={personalData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
