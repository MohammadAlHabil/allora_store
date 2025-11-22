import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ExpressCheckoutProvider } from "@/features/checkout/hooks/useExpressCheckout";
import Breadcrumb from "@/shared/components/Breadcrumb";
import Footer from "@/shared/components/Footer";
import Header from "@/shared/components/Header";
import { Toaster } from "@/shared/components/ui/sonner";
import { constructMetadata } from "@/shared/lib/metadata";
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

export const metadata = constructMetadata();

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
            <ExpressCheckoutProvider>
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
            </ExpressCheckoutProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
