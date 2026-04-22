import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from './providers';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'TOEFL Speaking Trainer',
  description: 'Practice TOEFL speaking with AI-powered feedback',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TOEFL Speak',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <div className="app-container">
              {children}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
