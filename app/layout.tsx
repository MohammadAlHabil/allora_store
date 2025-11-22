import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import Breadcrumb from "@/shared/components/Breadcrumb";
import Footer from "@/shared/components/Footer";
import Header from "@/shared/components/Header";
import { Toaster } from "@/shared/components/ui/sonner";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Allora Store - Fashion & Lifestyle",
  description: "Your premier destination for fashion, beauty, and lifestyle products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider refetchInterval={0} refetchOnWindowFocus={true}>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Header />
              <Breadcrumb />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <Toaster richColors position="top-center" />
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
