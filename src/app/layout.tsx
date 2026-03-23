import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google"
import { QueryProivder } from "@/components/query-provider";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

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
        className={cn(
          manrope.variable,
          plusJakarta.variable,
          "antialiased min-h-screen grain font-[family-name:var(--font-manrope)]"
        )}
      >
        <QueryProivder>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "#111827",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#E8ECF4",
              },
            }}
          />
          {children}
        </QueryProivder>
      </body>
    </html>
  );
}
