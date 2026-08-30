import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "زمام | إدارة أسطولك بذكاء",
  description:
    "زمام منصة ذكية لإدارة المركبات والسائقين والصيانة والوقود والمهام والتتبع من لوحة تحكم واحدة.",
  keywords: [
    "زمام",
    "إدارة الأساطيل",
    "تتبع المركبات",
    "إدارة السائقين",
    "الصيانة",
    "الوقود",
  ],
  authors: [{ name: "Zimam" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} scroll-smooth h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text font-sans selection:bg-primary/15 selection:text-ink">
        {children}
      </body>
    </html>
  );
}
