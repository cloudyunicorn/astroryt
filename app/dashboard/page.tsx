import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { auth } from '@/auth'
import Link from 'next/link'
import { Bot, CalendarDays, Star, BarChart, Settings, BookOpen, Shield, Sunrise, Sparkles } from 'lucide-react'

export default async function Dashboard() {
  const session = await auth()
  
  if (!session?.user) return <div>Not authenticated</div>

  return (
    <div className="min-h-screen p-6 space-y-8 bg-muted/40">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Welcome back, {session.user.name?.split(' ')[0] || 'Stellar Seeker'}!
          </h1>
          <p className="text-muted-foreground">Your current cosmic energy: 78% aligned</p>
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
        {/* Birth Chart Summary */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sunrise className="w-6 h-6 text-primary" />
              Your Birth Chart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
              {/* Zodiac Wheel Visualization Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-muted-foreground">Interactive Zodiac Wheel</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Sun Sign:</span>
                <span className="font-medium">Aquarius</span>
              </div>
              <div className="flex justify-between">
                <span>Moon Sign:</span>
                <span className="font-medium">Scorpio</span>
              </div>
              <div className="flex justify-between">
                <span>Ascendant:</span>
                <span className="font-medium">Leo</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="secondary">
              <Link href="/birth-chart">
                <BarChart className="w-4 h-4 mr-2" />
                Full Analysis
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
                <p className="text-sm truncate">What does Mercury retrograde mean for me...</p>
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

        {/* Daily Guidance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6 text-accent" />
              Today&apos;s Horoscope
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-accent/10">
              <p className="text-sm italic">
                &quot;The stars suggest focusing on creative endeavors today. Mercury&apos;s position...&quot;
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Love: ★★★★☆</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Career: ★★★☆☆</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/horoscopes">
                Weekly Forecast
                <CalendarDays className="w-4 h-4 ml-2" />
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
              <p className="text-sm">Focus on improving communication skills this month</p>
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
  )
}