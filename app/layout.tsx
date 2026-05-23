import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Kamas Revenue Tracker",
  description:
    "Track daily kamas revenue by server with a practical Next.js dashboard.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
