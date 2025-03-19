import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from '@/lib/constants';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from '@/components/ui/sonner';
import { ChatProvider } from '@/context/ChatContext';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: `%s | Astroryt`,
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Link to your manifest */}
        {/* <link rel="manifest" href="/manifest.json" /> */}
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#8b3bc4" />
        {/* Apple Touch Icon for iOS */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        {/* You can add more meta tags here as needed */}
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ChatProvider>
            <Providers>
              <Toaster />
              {children}
            </Providers>
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
