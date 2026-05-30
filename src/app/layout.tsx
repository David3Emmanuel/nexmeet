import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NexMeet — AI-powered networking companion for events",
    template: "%s — NexMeet",
  },
  description: "Set up in 2 minutes. Go live instantly. NexMeet maps the room and gives each attendee their 3 best connections in seconds.",
  metadataBase: new URL("https://nexmeet.app"),
  openGraph: {
    title: "NexMeet — AI-powered networking companion for events",
    description: "Set up in 2 minutes. Go live instantly. NexMeet maps the room and gives each attendee their 3 best connections in seconds.",
    url: "https://nexmeet.app",
    siteName: "NexMeet",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexMeet — AI-powered networking companion for events",
    description: "Set up in 2 minutes. Go live instantly. NexMeet maps the room and gives each attendee their 3 best connections in seconds.",
  },
};

import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
