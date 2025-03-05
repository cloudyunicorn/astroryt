import UserButton from '@/components/shared/header/user-button';
import React from 'react';
import Image from 'next/image';
import cosmicPattern from '@/assets/hero.svg';
import { auth } from "@/auth";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles, Bot, CalendarDays, Sunrise } from 'lucide-react';
import Dashboard from "../dashboard/page";

const Home = async () => {
  const session = await auth();

  if(!session) {
    return (
      <div className="relative min-h-[calc(100vh-80px)] bg-background">
        {/* Cosmic Background */}
        <div className="absolute inset-0 -z-10 opacity-20 dark:opacity-40">
          <Image
            src={cosmicPattern}
            alt="cosmic background"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Main Content */}
        <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                Discover Your Cosmic Blueprint
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Unveil your unique astrological profile powered by AI. Get personalized insights into your personality, 
                relationships, and future through advanced planetary analysis.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  <Link href="/sign-up" className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Start Free Analysis
                  </Link>
                </Button>
                <UserButton />
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              <div className="p-6 rounded-xl bg-card/50 backdrop-blur-md border hover:border-primary/30 transition-all">
                <Sunrise className="w-10 h-10 mb-4 text-primary mx-auto" />
                <h3 className="text-xl font-semibold mb-2">Birth Chart Analysis</h3>
                <p className="text-muted-foreground">Deep AI-powered analysis of your natal chart and planetary positions</p>
              </div>

              <div className="p-6 rounded-xl bg-card/50 backdrop-blur-md border hover:border-accent/30 transition-all">
                <Bot className="w-10 h-10 mb-4 text-accent mx-auto" />
                <h3 className="text-xl font-semibold mb-2">AI Astrologer Chat</h3>
                <p className="text-muted-foreground">24/7 access to our intelligent astrology assistant</p>
              </div>

              <div className="p-6 rounded-xl bg-card/50 backdrop-blur-md border hover:border-secondary/30 transition-all">
                <Sparkles className="w-10 h-10 mb-4 text-secondary mx-auto" />
                <h3 className="text-xl font-semibold mb-2">Daily Guidance</h3>
                <p className="text-muted-foreground">Personalized horoscopes based on current transits</p>
              </div>

              <div className="p-6 rounded-xl bg-card/50 backdrop-blur-md border hover:border-ring/30 transition-all">
                <CalendarDays className="w-10 h-10 mb-4 text-ring mx-auto" />
                <h3 className="text-xl font-semibold mb-2">Cosmic Calendar</h3>
                <p className="text-muted-foreground">Track important astrological events & planetary movements</p>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="mt-24 max-w-4xl mx-auto space-y-4">
              <h2 className="text-2xl font-semibold text-primary">Why Choose Stellar Insights?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-card rounded-lg">
                  <div className="text-3xl mb-2 text-primary">🌌</div>
                  <h4 className="font-medium mb-2">Precision AI Analysis</h4>
                  <p className="text-sm text-muted-foreground">Combining Vedic & Western astrology with machine learning</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg">
                  <div className="text-3xl mb-2 text-secondary">🔒</div>
                  <h4 className="font-medium mb-2">Private & Secure</h4>
                  <p className="text-sm text-muted-foreground">End-to-end encrypted birth data storage</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg">
                  <div className="text-3xl mb-2 text-accent">✨</div>
                  <h4 className="font-medium mb-2">Growing Wisdom</h4>
                  <p className="text-sm text-muted-foreground">Insights that evolve with your life journey</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard />;
};

export default Home;