import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ASU Sun Devil Crowd Tracker | By the student, For the student',
  description: 'By the student, For the student. Live occupancy, crowd density heatmap, and peak hour analytics for Arizona State University (ASU Tempe Campus).',
  keywords: ['ASU', 'Sun Devils', 'ASU Heatmap', 'Crowd Tracker', 'SDFC', 'Hayden Library', 'Memorial Union', 'Tempe Campus'],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg-main text-slate-900 min-h-screen antialiased selection:bg-asu-maroon selection:text-white">
        {children}
      </body>
    </html>
  );
}
