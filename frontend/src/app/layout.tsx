import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Meridiana | M&A Advisory for the Lower Middle Market",
    template: "%s | Meridiana",
  },
  description:
    "Meridiana advises lower-middle-market businesses on sell-side, buy-side and strategic transactions, with discretion, clarity and execution excellence.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
