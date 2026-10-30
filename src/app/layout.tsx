import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { InAppBrowserBanner } from '@/components/ui/InAppBrowserBanner';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'الأستاذ عمار رزق',
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
    <html lang="ar" dir="rtl" suppressHydrationWarning className={cairo.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-[#040D0E] dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <InAppBrowserBanner />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
