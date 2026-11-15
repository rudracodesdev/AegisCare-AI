import "./globals.css";
import React from "react";

export const metadata = {
  title: "AegisCare AI — Elderly Care & Medication Platform",
  description: "Smart, interconnected elderly healthcare & medication management ecosystem",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}