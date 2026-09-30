import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Kate · A little ahead of life",
  description: "A proactive banking companion. A KBC hackathon prototype.",
  icons: { icon: "/favicon.svg" },
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
