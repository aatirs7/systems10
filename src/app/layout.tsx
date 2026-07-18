import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Systems 10 - Outbound Engine",
  description: "Brand acquisition pipeline: source of truth for every sourced brand.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
