import type { Metadata } from 'next';
import Script from 'next/script';
import { Cairo, Geist, Geist_Mono } from 'next/font/google';
import { ToastProvider } from '@/shared/ui/Toast';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import { QueryProvider } from '@/shared/providers/QueryProvider';
import './globals.css';

const cairo = Cairo({
  variable: '--font-sans',
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'زمام | إدارة أسطولك بذكاء',
  description:
    'زمام منصة ذكية لإدارة المركبات والسائقين والصيانة والوقود والمهام والتتبع من لوحة تحكم واحدة.',
  keywords: [
    'زمام',
    'إدارة الأساطيل',
    'تتبع المركبات',
    'إدارة السائقين',
    'الصيانة',
    'الوقود',
  ],
  authors: [{ name: 'Zimam' }],
  icons: {
    icon: '/favicon.ico',
  },
};

const themeInitScript = `(function(){try{var s=localStorage.getItem('zamam-theme');var t=s||'system';var r=t;if(t==='system'){r=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',r);document.documentElement.setAttribute('data-theme-setting',t);if(r==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} ${geistSans.variable} ${geistMono.variable} scroll-smooth h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--zd-bg)] text-[var(--zd-text)] font-sans transition-colors duration-200 selection:bg-primary/15 selection:text-ink">
        <QueryProvider>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>{children}</AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
