import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TataDana Prime — Executive Personal Wealth & Cashflow OS",
  description:
    "Platform manajemen arus kas dan wealth tracking pribadi berbasis AI kelas enterprise yang terintegrasi langsung dengan Telegram. Multi-wallet ledger, scan struk multi-item, dan AI wealth advisor.",
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
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-ivory text-slate-900 antialiased selection:bg-tangerine-100 selection:text-tangerine-900">
        {children}
      </body>
    </html>
  );
}
