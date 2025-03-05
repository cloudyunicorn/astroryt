'use client';
import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

const Modetoggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="focus-visible:ring-0 focus-visible:ring-offset-0"
    >
      {theme === 'dark' ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </Button>
  );
};

export default Modetoggle;
