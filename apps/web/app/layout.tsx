import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Kancode",
  description: "AI engineering management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
