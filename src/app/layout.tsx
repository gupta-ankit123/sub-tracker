import type { Metadata } from "next";
import { Inter } from "next/font/google"
import { QueryProivder } from "@/components/query-provider";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SubTracker - Track Subscriptions & Save Money",
  description: "Track recurring subscriptions, utility bills, and budgets. Detect unused services and save money. Free forever.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(inter.className, "antialiased min-h-screen")}
      >
        <QueryProivder>
          <Toaster />
          {children}
        </QueryProivder>
      </body>
    </html>
  );
}
