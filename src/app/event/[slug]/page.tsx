import type { Metadata } from 'next';
import EventLanding from '../../../components/attendee/EventLanding';

// In production this would be fetched from DB by slug
function getEventBySlug(slug: string) {
  return {
    slug,
    name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    type: 'Hackathon',
    date: 'Sat, May 30 · 2026',
    venue: 'Zone Tech Park, Gbagada',
    organizer: 'Team Dial',
    about: 'A one-night AI hackathon bringing together student builders, founders, and mentors.',
    attendeeCount: 18,
    accent: '#FF5A2C',
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const event = getEventBySlug(resolvedParams.slug);
  return {
    title: `${event.name} — NexMeet`,
    description: `Join ${event.name} on NexMeet. AI matches you with the right people in seconds.`,
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const event = getEventBySlug(resolvedParams.slug);
  return <EventLanding event={event} />;
}
