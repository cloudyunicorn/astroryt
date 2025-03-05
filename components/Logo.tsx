'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import lightLogo from '@/assets/logo-light.svg';
import darkLogo from '@/assets/logo-dark.svg';
import neutralLogo from '@/assets/logo-dark.svg';
import { useRouter } from 'next/navigation';

export default function Logo() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogoClick = () => {
    router.push('/'); // This will trigger the loading state
  };

  // Use a neutral logo during hydration
  if (!mounted) {
    return (
      <div className="relative w-[150px] h-[50px]">
        <Image
          src={neutralLogo}
          width={2000}
          height={751}
          alt="Logo"
          className="object-contain"
          priority
        />
      </div>
    );
  }

  // Get the actual theme (system or user-set)
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const logoSrc = currentTheme === 'dark' ? darkLogo : lightLogo;

  return (
    <div className="relative w-[150px] h-[50px] cursor-pointer" onClick={handleLogoClick}>
      <Image
        src={logoSrc}
        width={2000}
        height={751}
        alt="Logo"
        className="object-contain"
      />
    </div>
  );
}