import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NexMeet — Meet the right people. Every time.",
    template: "%s — NexMeet",
  },
  description: "AI-powered networking matchmaking for live events. Attendees get their 3 best matches in seconds.",
  metadataBase: new URL("https://nexmeet.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
