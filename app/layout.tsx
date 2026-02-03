import type { Metadata } from "next";
import "./globals.css";
import CityProvider from "./components/CityProvider";

export const metadata: Metadata = {
  title: "PhysioConnect - Physiotherapy Management Platform",
  description: "Connect patients with physiotherapists for effective treatment management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CityProvider>
          {children}
        </CityProvider>
      </body>
    </html>
  );
}
