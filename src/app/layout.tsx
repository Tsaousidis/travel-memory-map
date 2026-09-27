import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Memory Map",
  description: "A personal, interactive map of your travels and memories.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
