import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Georgian } from "next/font/google";
import "../globals.css";
import "./admin.css";

const georgian = Noto_Sans_Georgian({ subsets: ["georgian", "latin"], weight: ["400", "700"], variable: "--font-georgian", display: "swap" });
const notoSans = Noto_Sans({ subsets: ["cyrillic", "latin"], weight: ["400", "700"], variable: "--font-cyrillic", display: "swap" });

export const metadata: Metadata = {
  title: { default: "ადმინ პანელი", template: "%s · SOLO ადმინი" },
  robots: { index: false, follow: false },
};

// Separate root layout: the admin shares the site's styles but not its header, footer or age gate.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={`${georgian.variable} ${notoSans.variable}`}>
      <body className="min-h-screen bg-mist font-sans">{children}</body>
    </html>
  );
}
