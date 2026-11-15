import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'ASU Sun Devil Crowd Tracker | By the student, For the student',
  description:
    'By the student, For the student. Live occupancy, crowd density heatmap, and peak hour analytics for Arizona State University (ASU Tempe Campus).',
  keywords: [
    'ASU',
    'Sun Devils',
    'ASU Heatmap',
    'Crowd Tracker',
    'SDFC',
    'Hayden Library',
    'Memorial Union',
    'Tempe Campus',
  ],
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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg-main text-slate-900 antialiased selection:bg-asu-maroon selection:text-white dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              classNames: {
                toast: 'font-sans',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
