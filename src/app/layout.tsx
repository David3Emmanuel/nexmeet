import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexMeet — Meet the right people. Every time.",
  description: "AI-powered networking matchmaking for events.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
