import type { Metadata } from 'next';
import LandingPage from '@/components/LandingPage';

export const metadata: Metadata = {
  title: 'NexMeet — Meet the right people. Every time.',
  description: 'AI-powered networking for live events. Attendees get their 3 best matches in seconds — no apps, no accounts.',
};

export default function Home() {
  return <LandingPage />;
}
