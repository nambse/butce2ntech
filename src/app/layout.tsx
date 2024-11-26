import type { Metadata } from "next";
import localFont from "next/font/local";
import { MainLayout } from "@/components/layout/main-layout";
import { Providers } from "@/components/providers";
import { WelcomeModal } from "@/components/welcome-modal";
import "./globals.css";
import { DebugStorage } from "@/components/debug-storage"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Bütçe Takip",
  description: "Kişisel bütçe ve harcama takip uygulaması",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={geistSans.className}>
        <Providers>
          <MainLayout>{children}</MainLayout>
          <WelcomeModal />
          <DebugStorage />
        </Providers>
      </body>
    </html>
  );
}
