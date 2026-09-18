import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FTQC Architecture Explorer",
  description:
    "Interactive viewer and simulator for comparing fault-tolerant quantum-computing architectures",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
