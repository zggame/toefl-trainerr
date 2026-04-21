import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TOEFL Speaking Trainer',
  description: 'Practice TOEFL speaking with AI-powered feedback and improve your score',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}