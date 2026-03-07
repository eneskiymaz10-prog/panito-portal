import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Panito Portal - Wholesale Order Management",
  description: "B2B wholesale portal for Panito protein snacks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
