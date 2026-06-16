import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app-shell/Providers";
import { Header } from "@/ui/layout/Header";
import { Footer } from "@/ui/layout/Footer";
import { MobileTabBar } from "@/ui/layout/MobileTabBar";
import { MobileSearchBar } from "@/ui/layout/MobileSearchBar";
import { AIAssistantWidget } from "@/modules/ai-assistant";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hairqoo — globalny system operacyjny branży fryzjerskiej",
  description:
    "Hairqoo 3.0 — wyszukiwarka, asystent AI i spersonalizowany feed dla świata fryzjerstwa i barberingu. Wydarzenia, edukatorzy, produkty i społeczność w jednym miejscu.",
};

export const viewport: Viewport = {
  themeColor: "#0b0b12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeScript = `(function(){try{var s=JSON.parse(localStorage.getItem("hairqoo3_theme")||"{}");var t=s&&s.state&&s.state.theme?s.state.theme:"dark";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" data-theme="dark" className={`${inter.variable} ${manrope.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          <Header />
          <MobileSearchBar />
          <main>{children}</main>
          <Footer />
          <MobileTabBar />
          <AIAssistantWidget />
        </Providers>
      </body>
    </html>
  );
}
