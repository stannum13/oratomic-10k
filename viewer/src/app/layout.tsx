import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oratomic — 10k Qubit Architecture",
  description:
    "Interactive viewer and simulator for fault-tolerant quantum computation with reconfigurable atomic qubits",
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
